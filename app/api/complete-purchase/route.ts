import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { TOS_VERSION, SERVER_PAYMENTS_ENABLED, PAYPAL_API_URL, INVOICE_NOTIFICATION_EMAIL } from '@/lib/constants'
import { getExpectedPriceCents } from '@/lib/serverPricing'
import { checkRateLimit } from '@/lib/rateLimit'
import { sendEmail } from '@/lib/email'

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

// Helper for Persistent Security Logging
async function logSecurityEvent(userId: string | null, type: string, metadata: any) {
    try {
        const admin = getSupabaseAdmin();
        await admin.from('security_events').insert({
            user_id: userId,
            event_type: type, // Ensure 'paypal_error' is allowed in check constraint or use generic 'session_blocked' if strict, but ideally add 'paypal_error' to migration
            metadata: metadata,
            ip_address: '0.0.0.0' // Placeholder as we are in backend
        });
    } catch (e) {
        console.error('[logSecurityEvent] Failed to log:', e);
    }
}

async function getPayPalAccessToken(): Promise<string> {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

    // Timeout 10s
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
            signal: controller.signal
        })
        clearTimeout(id);
        const data = await response.json()
        return data.access_token
    } catch (e) {
        clearTimeout(id);
        throw e;
    }
}

async function verifyPayPalOrder(orderId: string, expectedAmountCents: number, userId: string): Promise<{
    valid: boolean
    captureId?: string
    error?: string
}> {
    try {
        const accessToken = await getPayPalAccessToken()

        // Timeout 15s for Verify
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            signal: controller.signal
        })
        clearTimeout(id);

        if (!res.ok) {
            await logSecurityEvent(userId, 'paypal_error', { error: 'Order Not Found', orderId, status: res.status });
            return { valid: false, error: 'Ordine non trovato' }
        }

        const order = await res.json()

        if (order.status !== 'COMPLETED') {
            await logSecurityEvent(userId, 'paypal_error', { error: 'Order Not Completed', orderId, status: order.status });
            return { valid: false, error: 'Ordine non completato' }
        }

        const capture = order.purchase_units?.[0]?.payments?.captures?.[0]
        if (!capture) {
            await logSecurityEvent(userId, 'paypal_error', { error: 'No Capture Found', orderId });
            return { valid: false, error: 'Capture non trovato' }
        }

        const paidVal = parseFloat(capture.amount.value)
        const currency = capture.amount.currency_code

        // Tolleranza 1 cent
        if (Math.abs(paidVal - (expectedAmountCents / 100)) > 0.01) {
            await logSecurityEvent(userId, 'paypal_error', { error: 'Price Mismatch', orderId, paid: paidVal, expected: expectedAmountCents / 100 });
            return { valid: false, error: 'Importo errato' }
        }
        if (currency !== 'EUR') {
            await logSecurityEvent(userId, 'paypal_error', { error: 'Wrong Currency', orderId, currency });
            return { valid: false, error: 'Valuta errata' }
        }

        return { valid: true, captureId: capture.id }
    } catch (e: any) {
        console.error('PayPal Verify Error', e)
        await logSecurityEvent(userId, 'paypal_error', { error: 'Exception', message: e.message, orderId });
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

        const supabaseAdmin = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user || !user.email) return NextResponse.json({ ok: false, error: 'invalid_token' }, { status: 401 })

        // 2. Parse Body
        const body = await request.json()
        const { orderId, product_code, amount_cents } = body

        if (!orderId || !product_code || !amount_cents) {
            return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
        }

        // 3. Price Validation (SERVER TRUTH)
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

        // 4. Rate Limit
        const limitRes = await checkRateLimit(`purch_${user.id}`, 5, 60, false)
        if (!limitRes.success) return NextResponse.json({ ok: false, error: 'rate_limit' }, { status: 429 })

        // 5. TOS
        const { data: tos } = await supabaseAdmin.from('tos_acceptances').select('id').eq('user_id', user.id).eq('tos_version', TOS_VERSION).maybeSingle()
        if (!tos) return NextResponse.json({ ok: false, error: 'tos_required' }, { status: 403 })

        // 6. Verify PayPal
        const ver = await verifyPayPalOrder(orderId, truthPrice, user.id)
        if (!ver.valid || !ver.captureId) return NextResponse.json({ ok: false, error: ver.error }, { status: 402 })
        const captureId = ver.captureId

        // 7. Idempotency on Capture ID
        const { data: existing } = await supabaseAdmin.from('purchases').select('id').eq('paypal_capture_id', captureId).maybeSingle()
        if (existing) return NextResponse.json({ ok: true, alreadyProcessed: true })

        // 8. Execute Purchase (Database Write)
        // Fetch Billing Profile for Snapshot & Invoice
        const { data: billingData } = await supabaseAdmin
            .from('billing_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

        const billing = billingData as BillingProfile | null
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
                course_id: null, // DEPRECATED
                ...snapshotData
            })
            if (purErr) throw purErr
        }

        // 8.1 Determine Email Type for client-side sending
        let emailType: 'ACQUISTO_BASE' | 'ACQUISTO_INTERMEDIO' | 'ACQUISTO_AVANZATO' | 'ACQUISTO_TEAM' | null = null

        if (isTeam) {
            emailType = 'ACQUISTO_TEAM'
        } else if (product_code.includes('base')) {
            emailType = 'ACQUISTO_BASE'
        } else if (product_code.includes('intermedio')) {
            emailType = 'ACQUISTO_INTERMEDIO'
        } else if (product_code.includes('avanzato')) {
            emailType = 'ACQUISTO_AVANZATO'
        }

        // 9. Async Invoice Notification (FIRE AND FORGET)
        // Do NOT await this. Let it run in background.
        // On Vercel Serverless, wrapping in waitUntil is ideal if available, 
        // otherwise simply not awaiting works but unstable if lambda dies immediately.
        // For reliability, we log error inside.
        if (billing && billing.customer_type === 'company' && billing.vat_number) {
            // Use setImmediate or similar to detach if needed, but in NextJS route handlers
            // simply calling without await continues execution until response flush.
            // However, Vercel might freeze execution after response.
            // Best effort: Log start, try send, log end.
            sendInvoiceNotificationClean(billing, user.email, product_code, truthPrice, captureId)
                .catch(e => console.error('[complete-purchase] Invoice Send Background Error:', e));
        }

        // Return with email info for client-side email sending
        return NextResponse.json({
            ok: true,
            emailType,
            email: user.email
        })

    } catch (e) {
        console.error('Internal Error', e)
        return NextResponse.json({ ok: false, error: 'internal_server_error' }, { status: 500 })
    }
}

async function sendInvoiceNotificationClean(
    billing: BillingProfile,
    userEmail: string,
    productCode: string,
    amountCents: number,
    captureId: string
): Promise<void> {
    // 5 Second Timeout for Email Service
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);

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
            body: JSON.stringify(emailData),
            signal: controller.signal
        })
        clearTimeout(id);

        if (response.ok) {
            console.log(`[complete-purchase] Invoice notification sent for ${userEmail}`)
        } else {
            console.error(`[complete-purchase] Invoice notification failed: ${response.status}`)
        }
    } catch (err) {
        clearTimeout(id);
        console.error('[complete-purchase] Invoice notification error:', err)
        // Non-blocking for user, but we log strictly.
    }
}
