import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { TOS_VERSION, SERVER_PAYMENTS_ENABLED, PAYPAL_API_URL, PAYPAL_ENV } from '@/lib/constants'
import { getExpectedPriceCents } from '@/lib/serverPricing'
import { getAllCourses } from '@/lib/coursesData'
import { checkRateLimit } from '@/lib/rateLimit'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_ORDER_ID_REGEX = /^[A-Z0-9-]{10,32}$/i

async function getPayPalAccessToken(): Promise<string> {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

    const res = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    })

    if (!res.ok) {
        throw new Error('Errore autenticazione PayPal')
    }

    const data = await res.json()
    return data.access_token
}

async function verifyPayPalOrder(orderId: string): Promise<{
    valid: boolean
    level?: string
    amount?: number
    error?: string
    code?: string
}> {
    try {
        const accessToken = await getPayPalAccessToken()

        const res = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!res.ok) {
            return { valid: false, error: 'Ordine non trovato su PayPal', code: 'ORDER_NOT_FOUND' }
        }

        const order = await res.json()

        if (order.status !== 'COMPLETED') {
            return { valid: false, error: `Ordine non completato (${order.status})`, code: 'ORDER_NOT_COMPLETED' }
        }

        const capture = order.purchase_units?.[0]?.payments?.captures?.[0]
        if (!capture) {
            return { valid: false, error: 'Pagamento non catturato', code: 'NO_CAPTURE' }
        }

        const paidAmount = parseFloat(capture.amount.value)
        const currency = capture.amount.currency_code

        if (currency !== 'EUR') {
            return { valid: false, error: 'Valuta non valida', code: 'INVALID_CURRENCY' }
        }

        // Determina il livello dall'importo
        let level: string
        if (Math.abs(paidAmount - (getExpectedPriceCents('base') / 100)) < 0.01) level = 'Base'
        else if (Math.abs(paidAmount - (getExpectedPriceCents('intermediate') / 100)) < 0.01) level = 'Intermedio'
        else if (Math.abs(paidAmount - (getExpectedPriceCents('advanced') / 100)) < 0.01) level = 'Avanzato'
        else {
            return { valid: false, error: `Importo non riconosciuto: €${paidAmount}`, code: 'AMOUNT_UNKNOWN' }
        }

        return { valid: true, level, amount: paidAmount }

    } catch (error) {
        console.error('[replay-purchase] Errore verifica PayPal:', error)
        return { valid: false, error: 'Errore verifica pagamento', code: 'VERIFICATION_ERROR' }
    }
}

/**
 * POST /api/replay-purchase
 * 
 * Riprova l'attivazione per un ordine PayPal già completato.
 * Idempotente: se già attivato, risponde OK.
 * 
 * Body: { orderId: string }
 * Auth: Bearer token
 */
export async function POST(request: NextRequest) {
    try {
        // Auth
        const authHeader = request.headers.get('authorization') || ''
        if (!authHeader.toLowerCase().startsWith('bearer ')) {
            return NextResponse.json({ ok: false, error: 'missing_token', status: 'error' }, { status: 401 })
        }

        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        const { data: { user }, error: authError } = await getSupabaseAdmin().auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ ok: false, error: 'invalid_token', status: 'error' }, { status: 401 })
        }

        // Body
        const body = await request.json()
        const { orderId } = body

        if (!orderId || !PAYPAL_ORDER_ID_REGEX.test(orderId)) {
            return NextResponse.json({ ok: false, error: 'invalid_order_id', status: 'error' }, { status: 400 })
        }

        console.log(`[replay-purchase] Richiesta per orderId: ${orderId}, user: ${user.id}`)

        // Check se già attivato
        const { data: existingPurchase } = await getSupabaseAdmin()
            .from('purchases')
            .select('id, course_id')
            .eq('paypal_order_id', orderId)
            .limit(1)

        if (existingPurchase && existingPurchase.length > 0) {
            console.log(`[replay-purchase] Ordine ${orderId} già attivato`)
            return NextResponse.json({
                ok: true,
                status: 'activated',
                message: 'Ordine già attivato',
                coursesUnlocked: existingPurchase.length
            })
        }

        // RATE LIMITING (Package 2)
        const ip = request.headers.get('x-forwarded-for') || 'unknown'

        // Limit 1: User-based (3 requests / minute) - FAIL CLOSED
        const userLimit = await checkRateLimit(`replay_user_${user.id}`, 3, 60, false)
        if (!userLimit.success) {
            console.warn(`[RateLimit] User ${user.id} exceeded limit (replay)`)
            return NextResponse.json({ ok: false, error: 'rate_limit_exceeded' }, { status: 429 })
        }

        // Limit 2: IP-based (6 requests / minute) - FAIL CLOSED
        const ipLimit = await checkRateLimit(`replay_ip_${ip}`, 6, 60, false)
        if (!ipLimit.success) {
            console.warn(`[RateLimit] IP ${ip} exceeded limit (replay)`)
            return NextResponse.json({ ok: false, error: 'rate_limit_exceeded' }, { status: 429 })
        }

        // Verifica ordine PayPal
        const verification = await verifyPayPalOrder(orderId)

        if (!verification.valid) {
            console.log(`[replay-purchase] Ordine ${orderId} non valido: ${verification.error}`)
            return NextResponse.json({
                ok: false,
                status: 'invalid',
                error: verification.error,
                code: verification.code
            }, { status: 402 })
        }

        const level = verification.level!
        const amount = verification.amount!

        // Verifica ToS
        const { data: tosAcceptance } = await getSupabaseAdmin()
            .from('tos_acceptances')
            .select('id')
            .eq('user_id', user.id)
            .eq('tos_version', TOS_VERSION)
            .maybeSingle()

        if (!tosAcceptance) {
            return NextResponse.json({
                ok: false,
                status: 'tos_required',
                error: 'Accetta i Termini prima di procedere'
            }, { status: 403 })
        }

        // Sblocca corsi
        const allCourses = getAllCourses()
        const coursesToUnlock = allCourses.filter(c => c.level === level)

        if (coursesToUnlock.length === 0) {
            return NextResponse.json({
                ok: false,
                status: 'error',
                error: 'Nessun corso trovato per questo livello'
            }, { status: 500 })
        }

        const purchaseRecords = coursesToUnlock.map(course => ({
            user_id: user.id,
            course_id: course.title,
            amount: amount / coursesToUnlock.length,
            paypal_order_id: orderId
        }))

        const { error: insertError } = await getSupabaseAdmin()
            .from('purchases')
            .insert(purchaseRecords)

        if (insertError) {
            // Idempotenza constraint
            if (insertError.code === '23505') {
                console.log(`[replay-purchase] Ordine ${orderId} già presente (constraint)`)
                return NextResponse.json({
                    ok: true,
                    status: 'activated',
                    message: 'Ordine già attivato'
                })
            }

            console.error('[replay-purchase] Errore insert:', insertError)
            return NextResponse.json({
                ok: false,
                status: 'error',
                error: 'Errore salvataggio'
            }, { status: 500 })
        }

        console.log(`[replay-purchase] Ordine ${orderId} attivato: ${coursesToUnlock.length} corsi`)

        return NextResponse.json({
            ok: true,
            status: 'activated',
            message: 'Attivazione completata',
            level: level,
            coursesUnlocked: coursesToUnlock.length
        })

    } catch (error) {
        console.error('[replay-purchase] Errore interno:', error)
        return NextResponse.json({
            ok: false,
            status: 'error',
            error: 'Errore interno'
        }, { status: 500 })
    }
}
