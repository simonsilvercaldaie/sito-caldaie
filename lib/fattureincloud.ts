/**
 * Fatture in Cloud API v2 — Integration Module
 * 
 * Creates invoices automatically after successful purchases.
 * Uses Manual Authentication (permanent token, no OAuth flow needed).
 * 
 * DESIGN:
 * - Non-blocking: never throws, always returns a result
 * - Idempotent: checks fic_invoice_id before creating
 * - All customers: both private (codice fiscale) and company (P.IVA)
 * - Configurable: FIC_ENABLED kill switch, VAT regime via FIC_VAT_RATE
 * - Future-ready: easy switch from forfettario (0%) to ordinario (22%)
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
        // VAT: 0 for regime forfettario (current), 22 for ordinario (future)
        vatRate: parseInt(process.env.FIC_VAT_RATE || '0', 10),
        vatId: process.env.FIC_VAT_ID ? parseInt(process.env.FIC_VAT_ID, 10) : 66, // Default to 66 for Simon's forfettario
        // For forfettario regime, the exemption text on every invoice
        vatExemptionText: process.env.FIC_VAT_EXEMPTION_TEXT || 
            'Operazione in franchigia da IVA ai sensi dell\'art. 1, commi da 54 a 89, della Legge n. 190/2014 e ss.mm.ii.',
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
    phone?: string // Aggiunto telefono opzionale per retrocompatibilità
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
    'base': 'Video Corso Formazione Tecnica — Pacchetto Base (9 Video)',
    'intermediate': 'Video Corso Formazione Tecnica — Pacchetto Intermedio (9 Video)',
    'advanced': 'Video Corso Formazione Tecnica — Pacchetto Avanzato (9 Video)',
    'complete': 'Video Corso Formazione Tecnica — Pacchetto Completo (27 Video)',
    'complete_bundle': 'Video Corso Formazione Tecnica — Pacchetto Completo Bundle (27 Video)',
    'multi_5': 'Licenza Multidipendente 5 Posti — Video Corso Completo',
    'multi_10': 'Licenza Multidipendente 10 Posti — Video Corso Completo',
    'multi_25': 'Licenza Multidipendente 25 Posti — Video Corso Completo',
    'scuola_10': 'Licenza Scuola/Formazione 10 Posti — Video Corso Completo',
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
// BUILD ENTITY (Customer) FOR INVOICE
// -------------------------------------------------------------------

/**
 * Builds the entity object for the FIC invoice.
 * Handles both private customers (codice fiscale) and companies (P.IVA + SDI).
 */
function buildEntityFromBilling(billing: BillingData): any {
    const entity: any = {
        name: billing.customer_type === 'company' && billing.company_name
            ? billing.company_name
            : `${billing.first_name} ${billing.last_name}`,
        first_name: billing.first_name,
        last_name: billing.last_name,
        address_street: billing.address || undefined,
        address_city: billing.city || undefined,
        address_postal_code: billing.postal_code || undefined,
        country: 'Italia',
        country_iso: 'IT',
        phone: billing.phone || undefined, // Aggiunto telefono all'anagrafica
    }

    if (billing.customer_type === 'company') {
        // Azienda: P.IVA + Codice SDI/PEC obbligatori per fattura elettronica
        if (billing.vat_number) entity.vat_number = billing.vat_number
        if (billing.sdi_code) entity.ei_code = billing.sdi_code
    } else {
        // Privato: Codice Fiscale
        if (billing.fiscal_code) entity.tax_code = billing.fiscal_code
        // Privati: codice destinatario = "0000000" per fattura elettronica
        entity.ei_code = '0000000'
    }

    return entity
}

// -------------------------------------------------------------------
// INVOICE CREATION
// -------------------------------------------------------------------

/**
 * Creates an invoice on Fatture in Cloud.
 * Works for BOTH private and company customers.
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
        // 1. Build the entity (customer)
        const entity = buildEntityFromBilling(billing)

        // 2. Calculate amounts
        const grossAmount = amountCents / 100
        let netPrice: number
        let vatValue: number

        if (config.vatRate === 0) {
            // Regime forfettario: no VAT, the gross IS the net
            netPrice = grossAmount
            vatValue = 0
        } else {
            // Regime ordinario: price includes VAT, scorporo
            netPrice = grossAmount / (1 + config.vatRate / 100)
            vatValue = config.vatRate
        }

        // 3. Build the invoice payload
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

        // Build VAT object
        const vatObj: any = {}
        if (config.vatId) {
            vatObj.id = config.vatId
        } else {
            vatObj.value = vatValue
            if (vatValue === 0) {
                vatObj.description = config.vatExemptionText
            }
        }

        const invoicePayload: any = {
            data: {
                type: 'invoice',
                date: today,
                entity: entity,
                items_list: [
                    {
                        product_id: null,
                        code: productCode,
                        name: getProductDescription(productCode),
                        net_price: parseFloat(netPrice.toFixed(2)),
                        qty: 1,
                        vat: vatObj,
                        discount: 0,
                    }
                ],
                payments_list: [
                    {
                        amount: grossAmount,
                        due_date: today,
                        status: 'not_paid',
                    }
                ],
                currency: {
                    id: 'EUR',
                },
                language: {
                    code: 'it',
                    name: 'Italiano',
                },
                notes: `Pagamento PayPal — Rif: ${captureId}\nEmail: ${userEmail}`,
                // Electronic invoicing
                e_invoice: true,
            }
        }

        // 4. Create the invoice
        const customerLabel = billing.customer_type === 'company' 
            ? `${billing.company_name} (P.IVA: ${billing.vat_number})`
            : `${billing.first_name} ${billing.last_name} (CF: ${billing.fiscal_code})`
        
        console.log(`[FIC] Creating invoice for ${customerLabel}, product=${productCode}, amount=€${grossAmount}`)
        
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
        const invoiceNumber = result.data?.data?.number
        console.log(`[FIC] ✅ Invoice created: id=${invoiceId}, number=${invoiceNumber}`)

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
 */
export async function createInvoiceIfEnabled(
    billing: BillingData,
    userEmail: string,
    productCode: string,
    amountCents: number,
    captureId: string,
    purchaseId?: string
): Promise<InvoiceResult> {
    const result = await createInvoice(billing, userEmail, productCode, amountCents, captureId, purchaseId)

    if (result.skipped && result.skipReason !== 'already_created') {
        console.log(`[FIC] Skipped: ${result.skipReason}`)
    }

    if (!result.success && !result.skipped) {
        console.error(`[FIC] Invoice creation failed for ${userEmail}: ${result.error}`)
    }

    return result
}
