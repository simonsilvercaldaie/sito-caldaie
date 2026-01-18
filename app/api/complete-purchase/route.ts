import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TOS_VERSION, PAYMENTS_ENABLED, PAYPAL_API_URL, PAYPAL_ENV } from '@/lib/constants'
import { getExpectedPrice } from '@/lib/serverPricing'
import { getAllCourses } from '@/lib/coursesData'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!

// Regex permissiva per orderId PayPal
const PAYPAL_ORDER_ID_REGEX = /^[A-Z0-9-]{10,32}$/i

/**
 * Ottiene access token PayPal per chiamate API
 */
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
        const error = await res.text()
        console.error('[complete-purchase] Errore auth PayPal:', error)
        throw new Error('Impossibile autenticarsi con PayPal')
    }

    const data = await res.json()
    return data.access_token
}

/**
 * Verifica ordine PayPal: stato, importo, valuta
 */
async function verifyPayPalOrder(orderId: string, expectedAmount: number): Promise<{
    valid: boolean
    error?: string
    code?: string
    orderDetails?: any
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
            console.error(`[complete-purchase] Ordine ${orderId} non trovato su PayPal`)
            return { valid: false, error: 'Ordine non trovato', code: 'ORDER_NOT_FOUND' }
        }

        const order = await res.json()

        if (order.status !== 'COMPLETED') {
            console.error(`[complete-purchase] Ordine ${orderId} stato: ${order.status}`)
            return {
                valid: false,
                error: `Ordine non completato (stato: ${order.status})`,
                code: 'ORDER_NOT_COMPLETED'
            }
        }

        const capture = order.purchase_units?.[0]?.payments?.captures?.[0]
        if (!capture) {
            console.error(`[complete-purchase] Ordine ${orderId} nessun pagamento catturato`)
            return { valid: false, error: 'Nessun pagamento catturato', code: 'NO_CAPTURE' }
        }

        const paidAmount = parseFloat(capture.amount.value)
        const currency = capture.amount.currency_code

        if (currency !== 'EUR') {
            console.error(`[complete-purchase] Ordine ${orderId} valuta errata: ${currency}`)
            return {
                valid: false,
                error: `Valuta non valida: ${currency}`,
                code: 'INVALID_CURRENCY'
            }
        }

        if (Math.abs(paidAmount - expectedAmount) > 0.01) {
            console.error(`[complete-purchase] Ordine ${orderId} importo: ${paidAmount}€, atteso: ${expectedAmount}€`)
            return {
                valid: false,
                error: `Importo non corrispondente: ${paidAmount}€ (atteso: ${expectedAmount}€)`,
                code: 'AMOUNT_MISMATCH'
            }
        }

        return {
            valid: true,
            orderDetails: {
                orderId: order.id,
                status: order.status,
                amount: paidAmount,
                currency: currency,
                payerEmail: order.payer?.email_address
            }
        }

    } catch (error) {
        console.error('[complete-purchase] Errore verifica PayPal:', error)
        return { valid: false, error: 'Errore durante la verifica del pagamento', code: 'VERIFICATION_ERROR' }
    }
}

/**
 * POST /api/complete-purchase
 * 
 * PUNTO DI VERITÀ per il pagamento.
 * Usa createClient da @supabase/ssr per leggere la sessione dai cookie.
 */
export async function POST(request: NextRequest) {
    try {
        // Verifica pagamenti abilitati
        if (!PAYMENTS_ENABLED) {
            console.error('[complete-purchase] Pagamenti disabilitati')
            return NextResponse.json(
                { error: 'Pagamenti temporaneamente non disponibili', code: 'PAYMENTS_DISABLED' },
                { status: 503 }
            )
        }

        // Parsing e validazione input
        const body = await request.json()
        const { orderId, level } = body

        if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
            console.error('[complete-purchase] orderId mancante o vuoto')
            return NextResponse.json(
                { error: 'ID ordine mancante', code: 'MISSING_ORDER_ID' },
                { status: 400 }
            )
        }

        if (!PAYPAL_ORDER_ID_REGEX.test(orderId)) {
            console.error(`[complete-purchase] orderId formato non valido: ${orderId}`)
            return NextResponse.json(
                { error: 'Formato ID ordine non valido', code: 'INVALID_ORDER_ID_FORMAT' },
                { status: 400 }
            )
        }

        if (!level || !['Base', 'Intermedio', 'Avanzato'].includes(level)) {
            console.error(`[complete-purchase] level non valido: ${level}`)
            return NextResponse.json(
                { error: 'Livello non valido', code: 'INVALID_LEVEL' },
                { status: 400 }
            )
        }

        // Calcolo prezzo server-side
        const expectedAmount = getExpectedPrice(level)
        if (expectedAmount === null) {
            console.error(`[complete-purchase] Prezzo non trovato per level: ${level}`)
            return NextResponse.json(
                { error: 'Prezzo non determinabile', code: 'PRICE_NOT_FOUND' },
                { status: 500 }
            )
        }

        // Autenticazione con @supabase/ssr
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error('[complete-purchase] Utente non autenticato:', authError?.message)
            return NextResponse.json(
                { error: 'Non autenticato', code: 'UNAUTHORIZED' },
                { status: 401 }
            )
        }

        // Idempotenza: verifica se ordine già processato
        const { data: existingPurchase } = await supabase
            .from('purchases')
            .select('id')
            .eq('paypal_order_id', orderId)
            .maybeSingle()

        if (existingPurchase) {
            console.log(`[complete-purchase] IDEMPOTENZA: Ordine ${orderId} già processato.`)
            return NextResponse.json({
                success: true,
                alreadyProcessed: true,
                message: 'Ordine già elaborato'
            })
        }

        // Verifica ToS
        const { data: tosAcceptance, error: tosError } = await supabase
            .from('tos_acceptances')
            .select('id')
            .eq('user_id', user.id)
            .eq('tos_version', TOS_VERSION)
            .maybeSingle()

        if (tosError) {
            console.error('[complete-purchase] Errore verifica ToS:', tosError)
            return NextResponse.json(
                { error: 'Errore verifica Termini', code: 'TOS_CHECK_ERROR' },
                { status: 500 }
            )
        }

        if (!tosAcceptance) {
            return NextResponse.json(
                { error: 'Accetta i Termini per procedere', code: 'TOS_NOT_ACCEPTED' },
                { status: 403 }
            )
        }

        // Verifica ordine PayPal
        const verification = await verifyPayPalOrder(orderId, expectedAmount)

        if (!verification.valid) {
            return NextResponse.json(
                { error: verification.error || 'Pagamento non verificato', code: verification.code || 'PAYMENT_VERIFICATION_FAILED' },
                { status: 402 }
            )
        }

        // Ottieni corsi da sbloccare
        const allCourses = getAllCourses()
        const coursesToUnlock = allCourses.filter(c => c.level === level)

        if (coursesToUnlock.length === 0) {
            console.error(`[complete-purchase] Nessun corso trovato per level: ${level}`)
            return NextResponse.json(
                { error: 'Nessun corso trovato per questo livello', code: 'NO_COURSES_FOUND' },
                { status: 500 }
            )
        }

        // Salvataggio acquisto
        const purchaseRecords = coursesToUnlock.map(course => ({
            user_id: user.id,
            course_id: course.title,
            amount: expectedAmount / coursesToUnlock.length,
            paypal_order_id: orderId
        }))

        const { error: purchaseError } = await supabase
            .from('purchases')
            .insert(purchaseRecords)

        if (purchaseError) {
            if (purchaseError.code === '23505') {
                console.log(`[complete-purchase] IDEMPOTENZA (DB): Ordine ${orderId} già presente.`)
                return NextResponse.json({
                    success: true,
                    alreadyProcessed: true,
                    message: 'Ordine già elaborato'
                })
            }

            console.error('[complete-purchase] Errore salvataggio acquisto:', purchaseError)
            return NextResponse.json(
                { error: 'Errore salvataggio acquisto', code: 'PURCHASE_ERROR' },
                { status: 500 }
            )
        }

        console.log(`[complete-purchase] Ordine ${orderId} completato: ${coursesToUnlock.length} corsi sbloccati per user ${user.id}`)

        return NextResponse.json({
            success: true,
            userId: user.id,
            level: level,
            coursesUnlocked: coursesToUnlock.length,
            paypalOrderId: orderId,
            environment: PAYPAL_ENV
        })

    } catch (error) {
        console.error('[complete-purchase] Errore interno:', error)
        return NextResponse.json(
            { error: 'Errore interno del server', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}
