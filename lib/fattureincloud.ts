/**
 * Fatture in Cloud API v2 — Integration Module
 * 
 * Creates invoices automatically after successful purchases.
 * Uses Manual Authentication (permanent token, no OAuth flow needed).
 * 
 * DESIGN:
 * - Non-blocking: never throws, always returns a result
 * - Idempotent: checks fic_invoice_id before creating
 * - Configurable: FIC_ENABLED kill switch, VAT regime via FIC_VAT_RATE
 * - Fallback: caller can fall back to email notification on failure
 */

import { createClient } from '@supabase/supabase-js'

// -------------------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------------------

const FIC_BASE_URL = 'https://api-v2.fattureincloud.it'

function getFicConfig() {
    return {
        accessToken: process.env.FIC_ACCESS_TOKEN || '',
        companyId: process.env.FIC_COMPANY_ID || '',
        enabled: process.env.FIC_ENABLED === 'true',
        // VAT: 22 for regime ordinario, 0 for forfettario
        vatRate: parseInt(process.env.FIC_VAT_RATE || '22', 10),
        // For forfettario regime, the exemption text
        vatExemptionText: process.env.FIC_VAT_EXEMPTION_TEXT || 
            'Operazione non soggetta a IVA ai sensi dell\'art. 1, commi da 54 a 89, della Legge n. 190/2014',
    }
}

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// -------------------------------------------------------------------
// TYPES
// -------------------------------------------------------------------

export interface BillingData {
    customer_type: 'private' | 'company'
    first_name: string
    last_name: string
    company_name: string | null
    vat_number: string | null
    sdi_code: string | null
    fiscal_code: string | null
    address: string
    city: string
    postal_code: string
}

export interface InvoiceResult {
    success: boolean
    invoiceId?: number
    error?: string
    skipped?: boolean
    skipReason?: string
}

// -------------------------------------------------------------------
// PRODUCT → INVOICE DESCRIPTION MAPPING
// -------------------------------------------------------------------

const PRODUCT_DESCRIPTIONS: Record<string, string> = {
    'base': 'Corso Metodo UKT — Pacchetto Base (9 Video)',
    'intermediate': 'Corso Metodo UKT — Pacchetto Intermedio (9 Video)',
    'advanced': 'Corso Metodo UKT — Pacchetto Avanzato (9 Video)',
    'complete': 'Corso Metodo UKT — Pacchetto Completo (27 Video)',
    'complete_bundle': 'Corso Metodo UKT — Pacchetto Completo Bundle (27 Video)',
    'multi_5': 'Licenza Multidipendente 5 Posti — Corso Metodo UKT Completo',
    'multi_10': 'Licenza Multidipendente 10 Posti — Corso Metodo UKT Completo',
    'multi_25': 'Licenza Multidipendente 25 Posti — Corso Metodo UKT Completo',
    'scuola_10': 'Licenza Scuola/Formazione 10 Posti — Corso Metodo UKT Completo',
    'extra_invito_1': 'Pacchetto Invito Extra (+1 Posto) — Licenza Multidipendente',
}

function getProductDescription(productCode: string): string {
    return PRODUCT_DESCRIPTIONS[productCode] || `Corso Metodo UKT — ${productCode}`
}

// -------------------------------------------------------------------
// API HELPERS
// -------------------------------------------------------------------

async function ficFetch(
    path: string, 
    method: string = 'GET', 
    body?: any
): Promise<{ ok: boolean; status: number; data: any }> {
    const config = getFicConfig()
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    try {
        const res = await fetch(`${FIC_BASE_URL}${path}`, {
            method,
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal
        })
        clearTimeout(timeoutId)

        const data = await res.json()
        return { ok: res.ok, status: res.status, data }
    } catch (e: any) {
        clearTimeout(timeoutId)
        throw e
    }
}

// -------------------------------------------------------------------
// CLIENT (ENTITY) MANAGEMENT
// -------------------------------------------------------------------

/**
 * Finds or creates a client entity in FIC by VAT number.
 * Returns the entity object to embed in the invoice.
 */
async function findOrCreateClient(
    billing: BillingData
): Promise<{ id?: number; name: string; vat_number?: string; tax_code?: string; 
    address_street?: string; address_city?: string; address_postal_code?: string;
    country?: string; ei_code?: string }> {
    
    const config = getFicConfig()
    const companyId = config.companyId

    // Try to find existing client by VAT number
    if (billing.vat_number) {
        try {
            const searchRes = await ficFetch(
                `/c/${companyId}/entities/clients?q=${encodeURIComponent(billing.vat_number)}`
            )
            if (searchRes.ok && searchRes.data?.data?.length > 0) {
                const existing = searchRes.data.data[0]
                console.log(`[FIC] Found existing client: id=${existing.id}, name=${existing.name}`)
                return existing
            }
        } catch (e) {
            console.warn('[FIC] Client search failed, will create inline:', e)
        }
    }

    // Build entity for inline creation (FIC will create the client automatically 
    // when creating the invoice with entity data)
    const entity: any = {
        name: billing.company_name || `${billing.first_name} ${billing.last_name}`,
        vat_number: billing.vat_number || undefined,
        tax_code: billing.fiscal_code || undefined,
        address_street: billing.address || undefined,
        address_city: billing.city || undefined,
        address_postal_code: billing.postal_code || undefined,
        country: 'Italia',
        country_iso: 'IT',
    }

    // SDI code for electronic invoicing
    if (billing.sdi_code) {
        entity.ei_code = billing.sdi_code
    }

    return entity
}

// -------------------------------------------------------------------
// INVOICE CREATION
// -------------------------------------------------------------------

/**
 * Creates an invoice on Fatture in Cloud.
 * 
 * @param billing - Customer billing data from billing_profiles table
 * @param userEmail - Customer email
 * @param productCode - Product code (e.g. 'base', 'multi_5')
 * @param amountCents - Amount in cents (EUR)
 * @param captureId - PayPal capture ID for reference
 * @param purchaseId - Database purchase ID (for updating fic_invoice_id)
 */
export async function createInvoice(
    billing: BillingData,
    userEmail: string,
    productCode: string,
    amountCents: number,
    captureId: string,
    purchaseId?: string
): Promise<InvoiceResult> {
    const config = getFicConfig()

    // Guard: FIC not enabled
    if (!config.enabled) {
        return { success: false, skipped: true, skipReason: 'FIC_ENABLED=false' }
    }

    // Guard: missing credentials
    if (!config.accessToken || !config.companyId) {
        console.error('[FIC] Missing FIC_ACCESS_TOKEN or FIC_COMPANY_ID')
        return { success: false, error: 'Missing FIC credentials' }
    }

    // Guard: only for companies with VAT
    if (billing.customer_type !== 'company' || !billing.vat_number) {
        return { success: false, skipped: true, skipReason: 'Not a company or no VAT number' }
    }

    // Idempotency: check if invoice already created for this purchase
    if (purchaseId) {
        try {
            const admin = getSupabaseAdmin()
            const { data: existing } = await admin
                .from('purchases')
                .select('fic_invoice_id')
                .eq('id', purchaseId)
                .maybeSingle()
            
            if (existing?.fic_invoice_id) {
                console.log(`[FIC] Invoice already exists for purchase ${purchaseId}: FIC #${existing.fic_invoice_id}`)
                return { success: true, invoiceId: existing.fic_invoice_id, skipped: true, skipReason: 'already_created' }
            }
        } catch (e) {
            console.warn('[FIC] Idempotency check failed, proceeding:', e)
        }
    }

    try {
        // 1. Find or create the client entity
        const entity = await findOrCreateClient(billing)

        // 2. Calculate amounts
        const grossAmount = amountCents / 100
        let netPrice: number
        let vatValue: number

        if (config.vatRate === 0) {
            // Regime forfettario: no VAT
            netPrice = grossAmount
            vatValue = 0
        } else {
            // Regime ordinario: price includes VAT, scorporo
            netPrice = grossAmount / (1 + config.vatRate / 100)
            vatValue = config.vatRate
        }

        // 3. Build the invoice payload
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

        const invoicePayload: any = {
            data: {
                type: 'invoice',
                date: today,
                entity: {
                    ...entity,
                },
                items_list: [
                    {
                        product_id: null,
                        code: productCode,
                        name: getProductDescription(productCode),
                        net_price: parseFloat(netPrice.toFixed(2)),
                        qty: 1,
                        vat: {
                            value: vatValue,
                            ...(vatValue === 0 ? { description: config.vatExemptionText, is_disabled: true } : {}),
                        },
                        discount: 0,
                    }
                ],
                payments_list: [
                    {
                        amount: grossAmount,
                        due_date: today,
                        paid_date: today,
                        status: 'paid',
                        payment_account: null, // Will use FIC default
                    }
                ],
                currency: {
                    id: 'EUR',
                },
                language: {
                    code: 'it',
                    name: 'Italiano',
                },
                notes: `Rif. PayPal: ${captureId}\nEmail cliente: ${userEmail}`,
                // Electronic invoicing (fattura elettronica)
                e_invoice: true,
                // Let FIC handle numbering automatically
                numeration: '/FE', // Common convention: invoice_number/FE
            }
        }

        // 4. Create the invoice
        console.log(`[FIC] Creating invoice for ${billing.company_name} (${billing.vat_number}), product=${productCode}, amount=€${grossAmount}`)
        
        const result = await ficFetch(
            `/c/${config.companyId}/issued_documents`,
            'POST',
            invoicePayload
        )

        if (!result.ok) {
            console.error(`[FIC] Invoice creation failed: ${result.status}`, JSON.stringify(result.data))
            return { success: false, error: `FIC API error: ${result.status} — ${JSON.stringify(result.data?.error || result.data)}` }
        }

        const invoiceId = result.data?.data?.id
        console.log(`[FIC] ✅ Invoice created successfully: id=${invoiceId}`)

        // 5. Save invoice ID back to purchase record
        if (purchaseId && invoiceId) {
            try {
                const admin = getSupabaseAdmin()
                await admin
                    .from('purchases')
                    .update({ fic_invoice_id: invoiceId })
                    .eq('id', purchaseId)
                console.log(`[FIC] Updated purchase ${purchaseId} with fic_invoice_id=${invoiceId}`)
            } catch (e) {
                console.warn('[FIC] Failed to update purchase with invoice ID:', e)
                // Non-fatal: the invoice was still created
            }
        }

        return { success: true, invoiceId }

    } catch (e: any) {
        console.error('[FIC] Exception during invoice creation:', e)
        return { success: false, error: e.message || 'Unknown error' }
    }
}

// -------------------------------------------------------------------
// HIGH-LEVEL WRAPPER (used by purchase routes)
// -------------------------------------------------------------------

/**
 * Fire-and-forget wrapper that creates an invoice if FIC is enabled.
 * Never throws — logs errors and returns the result.
 * 
 * @param sendFallbackEmail - Optional callback to send email notification as fallback
 */
export async function createInvoiceIfEnabled(
    billing: BillingData,
    userEmail: string,
    productCode: string,
    amountCents: number,
    captureId: string,
    purchaseId?: string,
    sendFallbackEmail?: () => Promise<void>
): Promise<InvoiceResult> {
    const result = await createInvoice(billing, userEmail, productCode, amountCents, captureId, purchaseId)

    if (result.skipped) {
        // FIC disabled or not applicable — fall back to email
        if (result.skipReason === 'FIC_ENABLED=false' && sendFallbackEmail) {
            console.log('[FIC] Disabled, sending fallback email notification')
            await sendFallbackEmail().catch(e => console.error('[FIC] Fallback email error:', e))
        }
        return result
    }

    if (!result.success) {
        // FIC failed — fall back to email
        console.error(`[FIC] Invoice creation failed: ${result.error}. Sending fallback email.`)
        if (sendFallbackEmail) {
            await sendFallbackEmail().catch(e => console.error('[FIC] Fallback email error:', e))
        }
    }

    return result
}
