import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { TOS_VERSION, SERVER_PAYMENTS_ENABLED, PAYPAL_API_URL, INVOICE_NOTIFICATION_EMAIL } from '@/lib/constants'
import { getExpectedPriceCents } from '@/lib/serverPricing'
import { checkRateLimit } from '@/lib/rateLimit'

// Type for billing profile
interface BillingProfile {
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

// Admin Client
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!

async function getPayPalAccessToken(): Promise<string> {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    })
    const data = await response.json()
    return data.access_token
}

async function verifyPayPalOrder(orderId: string, expectedAmountCents: number): Promise<{
    valid: boolean
    captureId?: string
    error?: string
}> {
    try {
        const accessToken = await getPayPalAccessToken()
        const res = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        })

        if (!res.ok) return { valid: false, error: 'Ordine non trovato' }
        const order = await res.json()

        if (order.status !== 'COMPLETED') return { valid: false, error: 'Ordine non completato' }

        const capture = order.purchase_units?.[0]?.payments?.captures?.[0]
        if (!capture) return { valid: false, error: 'Capture non trovato' }

        const paidVal = parseFloat(capture.amount.value)
        const currency = capture.amount.currency_code

        // Tolleranza 1 cent
        if (Math.abs(paidVal - (expectedAmountCents / 100)) > 0.01) {
            return { valid: false, error: 'Importo errato' }
        }
        if (currency !== 'EUR') return { valid: false, error: 'Valuta errata' }

        return { valid: true, captureId: capture.id }
    } catch (e) {
        console.error('PayPal Verify Error', e)
        return { valid: false, error: 'Eccezione Verifica' }
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!SERVER_PAYMENTS_ENABLED) {
            return NextResponse.json({ ok: false, error: 'payments_disabled' }, { status: 503 })
        }

        // 1. Auth Headers
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        if (!token) return NextResponse.json({ ok: false, error: 'missing_token' }, { status: 401 })

        // 2. Parse Body BEFORE Auth verification to fail fast on bad input? 
        // No, Auth first for security.
        const supabaseAdmin = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user || !user.email) return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 401 })

        // 3. Parse Body
        const body = await request.json()
        const { orderId, product_code, amount_cents } = body

        if (!orderId || !product_code || !amount_cents) {
            return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
        }

        // 4. Price Validation (SERVER TRUTH)
        let truthPrice = 0
        try {
            truthPrice = getExpectedPriceCents(product_code)
        } catch (e) {
            return NextResponse.json({ ok: false, error: 'invalid_product_code' }, { status: 400 })
        }

        // Security Check: Client vs Server amount
        if (amount_cents !== truthPrice) {
            return NextResponse.json({ ok: false, error: 'price_mismatch' }, { status: 400 })
        }

        // 5. Rate Limit
        const limitRes = await checkRateLimit(`purch_${user.id}`, 5, 60, false)
        if (!limitRes.success) return NextResponse.json({ ok: false, error: 'rate_limit' }, { status: 429 })

        // 6. TOS
        const { data: tos } = await supabaseAdmin.from('tos_acceptances').select('id').eq('user_id', user.id).eq('tos_version', TOS_VERSION).maybeSingle()
        if (!tos) return NextResponse.json({ ok: false, error: 'tos_required' }, { status: 403 })

        // 7. Verify PayPal
        const ver = await verifyPayPalOrder(orderId, truthPrice)
        if (!ver.valid || !ver.captureId) return NextResponse.json({ ok: false, error: ver.error }, { status: 402 })
        const captureId = ver.captureId

        // 8. Idempotency on Capture ID
        // Note: Using 'maybeSingle' to handle 0 or 1.
        const { data: existing } = await supabaseAdmin.from('purchases').select('id').eq('paypal_capture_id', captureId).maybeSingle()
        if (existing) return NextResponse.json({ ok: true, alreadyProcessed: true })

        // 9. Execute Purchase (LIFETIME LOGIC)
        // 9. Fetch Billing Profile for Snapshot & Invoice
        const { data: billingData } = await supabaseAdmin
            .from('billing_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

        const billing = billingData as BillingProfile | null

        // 10. Execute Purchase (LIFETIME LOGIC)
        const isTeam = product_code.startsWith('team_')

        // Common snapshot data
        const snapshotData = {
            snapshot_company_name: billing?.company_name || null,
            snapshot_vat_number: billing?.vat_number || null,
            snapshot_sdi_code: billing?.sdi_code || null,
            snapshot_fiscal_code: billing?.fiscal_code || null,
            snapshot_address: billing?.address || null,
            snapshot_city: billing?.city || null,
            snapshot_postal_code: billing?.postal_code || null
        }

        if (isTeam) {
            // --- RAMO TEAM ---
            const seats = parseInt(product_code.split('_')[1])

            const { data: lic, error: licErr } = await supabaseAdmin.from('team_licenses').insert({
                owner_user_id: user.id,
                seats: seats,
                company_name: billing?.company_name || user.email
            }).select().single()

            if (licErr || !lic) throw licErr

            const { error: memErr } = await supabaseAdmin.from('team_members').insert({
                team_license_id: lic.id,
                user_id: user.id
            })
            if (memErr) throw memErr

            const { error: purErr } = await supabaseAdmin.from('purchases').insert({
                user_id: user.id,
                plan_type: 'team',
                product_code: product_code,
                amount_cents: truthPrice,
                paypal_capture_id: captureId,
                team_license_id: lic.id,
                course_id: null,
                ...snapshotData
            })
            if (purErr) throw purErr

        } else {
            // --- RAMO INDIVIDUAL ---
            const { error: purErr } = await supabaseAdmin.from('purchases').insert({
                user_id: user.id,
                plan_type: 'individual',
                product_code: product_code,
                amount_cents: truthPrice,
                paypal_capture_id: captureId,
                team_license_id: null,
                course_id: product_code.toUpperCase(),
                ...snapshotData
            })
            if (purErr) throw purErr
        }

        // Send invoice notification if company
        if (billing && billing.customer_type === 'company' && billing.vat_number) {
            sendInvoiceNotification(
                billing,
                user.email,
                product_code,
                truthPrice,
                captureId
            ).catch(console.error)
        }

        return NextResponse.json({ ok: true })

    } catch (e) {
        console.error('Internal Error', e)
        return NextResponse.json({ ok: false, error: 'internal_server_error' }, { status: 500 })
    }
}

async function sendInvoiceNotification(
    billing: BillingProfile,
    userEmail: string,
    productCode: string,
    amountCents: number,
    captureId: string
): Promise<void> {
    try {
        const emailData = {
            service_id: 'service_fwvybtr',
            template_id: 'template_b8p58ci',
            user_id: 'NcJg5-hiu3gVJiJZ-',
            template_params: {
                from_name: 'FATTURAZIONE AUTOMATICA',
                from_email: INVOICE_NOTIFICATION_EMAIL,
                subject: `NUOVA FATTURA DA EMETTERE - ${billing.company_name || 'Azienda'}`,
                message: `
DATI FATTURAZIONE:
------------------
Nome: ${billing.first_name} ${billing.last_name}
Ragione Sociale: ${billing.company_name}
Partita IVA: ${billing.vat_number}
Codice SDI/PEC: ${billing.sdi_code || 'N/A'}
Email: ${userEmail}
Indirizzo: ${billing.address}, ${billing.postal_code} ${billing.city}

DETTAGLI ORDINE:
----------------
Prodotto: ${productCode}
Importo: €${(amountCents / 100).toFixed(2)}
ID PayPal: ${captureId}
Data: ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}
                `.trim()
            }
        }

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        })

        if (response.ok) {
            console.log(`[complete-purchase] Invoice notification sent for ${userEmail}`)
        } else {
            console.error(`[complete-purchase] Invoice notification failed: ${response.status}`)
        }
    } catch (err) {
        console.error('[complete-purchase] Invoice notification error:', err)
    }
}
