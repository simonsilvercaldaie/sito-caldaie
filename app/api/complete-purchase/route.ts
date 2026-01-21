import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { TOS_VERSION, SERVER_PAYMENTS_ENABLED, PAYPAL_API_URL } from '@/lib/constants'
import { getExpectedPriceCents } from '@/lib/serverPricing'
import { checkRateLimit } from '@/lib/rateLimit'

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
        const isTeam = product_code.startsWith('team_')

        if (isTeam) {
            // --- RAMO TEAM ---
            const seats = parseInt(product_code.split('_')[1])

            // Create License
            // Ignore legacy fields. Provide defaults only if DB requires them.
            // company_name might be required in legacy schema? 
            // Providing generic name just in case constraint exists. User said "ignore", but SQL might complain if NOT NULL.
            const { data: lic, error: licErr } = await supabaseAdmin.from('team_licenses').insert({
                owner_user_id: user.id,
                seats: seats,
                company_name: user.email // Fallback in case of constraint
            }).select().single()

            if (licErr || !lic) throw licErr

            // Add Owner
            const { error: memErr } = await supabaseAdmin.from('team_members').insert({
                team_license_id: lic.id,
                user_id: user.id
            })
            if (memErr) throw memErr

            // Record Purchase
            // ignore course_id (set null as per last instruction)
            const { error: purErr } = await supabaseAdmin.from('purchases').insert({
                user_id: user.id,
                plan_type: 'team',
                product_code: product_code,
                amount_cents: truthPrice,
                paypal_capture_id: captureId,
                team_license_id: lic.id,
                course_id: null
            })
            if (purErr) throw purErr

        } else {
            // --- RAMO INDIVIDUAL ---
            // plan_type = 'individual'
            // course_id = product_code upper (Legacy compat) or null? user said ignore for Team. 
            // For individual, let's keep it populated for legacy queries.
            const { error: purErr } = await supabaseAdmin.from('purchases').insert({
                user_id: user.id,
                plan_type: 'individual',
                product_code: product_code,
                amount_cents: truthPrice,
                paypal_capture_id: captureId,
                team_license_id: null,
                course_id: product_code.toUpperCase()
            })
            if (purErr) throw purErr
        }

        return NextResponse.json({ ok: true })

    } catch (e) {
        console.error('Internal Error', e)
        return NextResponse.json({ ok: false, error: 'internal_server_error' }, { status: 500 })
    }
}
