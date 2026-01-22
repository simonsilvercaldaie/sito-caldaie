import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { TOS_VERSION, SERVER_PAYMENTS_ENABLED, PAYPAL_API_URL } from '@/lib/constants'
import { getExpectedPriceCents, PRODUCT_PRICES_CENTS, ProductCode } from '@/lib/serverPricing'
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
    captureId?: string
    amountCents?: number
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

        return { valid: true, amountCents: Math.round(paidAmount * 100), captureId: capture.id }

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
 * Supporta: Livelli Singoli E Licenze Team.
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
        const supabaseAdmin = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

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

        // Check Legacy Order ID Check (Ottimizzazione rapida)
        const { data: existingPurchase } = await supabaseAdmin
            .from('purchases')
            .select('id, course_id')
            .eq('paypal_order_id', orderId)
            .maybeSingle()

        if (existingPurchase) {
            console.log(`[replay-purchase] Ordine ${orderId} già attivato (by OrderID)`)
            return NextResponse.json({
                ok: true,
                status: 'activated',
                message: 'Ordine già attivato'
            })
        }

        // RATE LIMITING
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const userLimit = await checkRateLimit(`replay_user_${user.id}`, 3, 60, false)
        if (!userLimit.success) return NextResponse.json({ ok: false, error: 'rate_limit_exceeded' }, { status: 429 })

        // Verifica ordine PayPal
        const verification = await verifyPayPalOrder(orderId)

        if (!verification.valid || !verification.amountCents || !verification.captureId) {
            console.log(`[replay-purchase] Verifica fallita: ${verification.error}`)
            return NextResponse.json({
                ok: false,
                status: 'invalid',
                error: verification.error,
                code: verification.code
            }, { status: 402 })
        }

        const captureId = verification.captureId
        const amountCents = verification.amountCents

        // IDEMPOTENZA SU CAPTURE ID (Strict Truth)
        const { data: existingCap } = await supabaseAdmin
            .from('purchases')
            .select('id')
            .eq('paypal_capture_id', captureId)
            .maybeSingle()

        if (existingCap) {
            console.log(`[replay-purchase] Capture ${captureId} già attivato`)
            return NextResponse.json({
                ok: true,
                status: 'activated',
                message: 'Ordine già attivato'
            })
        }

        // Verifica ToS
        const { data: tosAcceptance } = await supabaseAdmin
            .from('tos_acceptances')
            .select('id')
            .eq('user_id', user.id)
            .eq('tos_version', TOS_VERSION)
            .maybeSingle()

        if (!tosAcceptance) {
            // Nota: in replay è un caso limite, ma lo manteniamo per conformità.
            return NextResponse.json({
                ok: false,
                status: 'tos_required',
                error: 'Accetta i Termini prima di procedere'
            }, { status: 403 })
        }

        // DETERMINA PRODUCT CODE DALL'IMPORTO (Source of Truth: serverPricing)
        let productCode: string | null = null

        // Cerca match esatto nella mappa prezzi
        // PRODUCT_PRICES_CENTS è { "base": 20000, "team_5": 150000, ... }
        for (const [code, price] of Object.entries(PRODUCT_PRICES_CENTS)) {
            if (price === amountCents) {
                productCode = code
                break
            }
        }

        if (!productCode) {
            // Fallback: tolleranza +/- 1 cent per arrotondamenti
            for (const [code, price] of Object.entries(PRODUCT_PRICES_CENTS)) {
                if (Math.abs(price - amountCents) <= 1) {
                    productCode = code
                    break
                }
            }
        }

        if (!productCode) {
            console.error(`[replay-purchase] Importo non riconosciuto: ${amountCents}`)
            return NextResponse.json({ ok: false, error: `Importo non riconosciuto: €${(amountCents / 100).toFixed(2)}` }, { status: 400 })
        }

        console.log(`[replay-purchase] Match prodotto: ${productCode} per €${amountCents / 100}`)

        // Logica Differenziata (Team vs Individual)
        const isTeam = productCode.startsWith('team_')

        if (isTeam) {
            // --- LOGICA TEAM (Copiata da complete-purchase per coerenza) ---
            const seats = parseInt(productCode.split('_')[1])

            // 1. Crea Licenza
            // Nota: in replay non abbiamo i dati di fatturazione freschi del body, usiamo quelli nel profilo billing se ci sono.
            // L'importante è attivare l'accesso.
            const { data: lic, error: licErr } = await supabaseAdmin.from('team_licenses').insert({
                owner_user_id: user.id,
                seats: seats,
                company_name: user.email // Fallback temporaneo, l'utente aggiornerà il profilo billing
            }).select().single()

            if (licErr || !lic) {
                console.error('[replay-purchase] Errore creazione licenza team:', licErr)
                throw licErr
            }

            // 2. Aggiungi Owner ai membri
            const { error: memErr } = await supabaseAdmin.from('team_members').insert({
                team_license_id: lic.id,
                user_id: user.id
            })
            if (memErr) throw memErr

            // 3. Registra Acquisto
            const { error: purErr } = await supabaseAdmin.from('purchases').insert({
                user_id: user.id,
                plan_type: 'team',
                product_code: productCode,
                amount_cents: amountCents,
                paypal_order_id: orderId,
                paypal_capture_id: captureId,
                team_license_id: lic.id,
                course_id: null,
                validated_at: new Date().toISOString()
            })
            if (purErr) {
                if (purErr.code === '23505') { // Unique constraint violation (race condition)
                    return NextResponse.json({ ok: true, status: 'activated', message: 'Ordine già attivato' })
                }
                throw purErr
            }

        } else {
            // --- LOGICA INDIVIDUAL ---
            const { error: insertError } = await supabaseAdmin
                .from('purchases')
                .insert({
                    user_id: user.id,
                    plan_type: 'individual',
                    product_code: productCode,
                    amount_cents: amountCents,
                    paypal_order_id: orderId,
                    paypal_capture_id: captureId,
                    course_id: null,
                    validated_at: new Date().toISOString()
                })

            if (insertError) {
                if (insertError.code === '23505') {
                    return NextResponse.json({ ok: true, status: 'activated', message: 'Ordine già attivato' })
                }
                throw insertError
            }
        }

        console.log(`[replay-purchase] Successo attivazione ${productCode}`)

        return NextResponse.json({
            ok: true,
            status: 'activated',
            message: 'Attivazione completata',
            product_code: productCode,
            restored: true
        })

    } catch (error) {
        console.error('[replay-purchase] Errore interno:', error)
        return NextResponse.json({
            ok: false,
            status: 'error',
            error: 'Errore interno server'
        }, { status: 500 })
    }
}

