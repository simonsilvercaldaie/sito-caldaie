import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { TOS_VERSION, PAYMENTS_ENABLED, PAYPAL_API_URL, PAYPAL_ENV } from '@/lib/constants'
import { getExpectedPrice } from '@/lib/serverPricing'
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
        console.error('[complete-purchase] Errore auth PayPal')
        throw new Error('Errore autenticazione PayPal')
    }

    const data = await res.json()
    return data.access_token
}

async function verifyPayPalOrder(orderId: string, expectedAmount: number): Promise<{
    valid: boolean
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
            console.error(`[complete-purchase] Ordine ${orderId} non trovato`)
            return { valid: false, error: 'Ordine non trovato', code: 'ORDER_NOT_FOUND' }
        }

        const order = await res.json()

        if (order.status !== 'COMPLETED') {
            console.error(`[complete-purchase] Ordine ${orderId} stato: ${order.status}`)
            return { valid: false, error: 'Ordine non completato', code: 'ORDER_NOT_COMPLETED' }
        }

        const capture = order.purchase_units?.[0]?.payments?.captures?.[0]
        if (!capture) {
            return { valid: false, error: 'Pagamento non catturato', code: 'NO_CAPTURE' }
        }

        const paidAmount = parseFloat(capture.amount.value)
        const currency = capture.amount.currency_code

        if (currency !== 'EUR') {
            console.error(`[complete-purchase] Valuta errata: ${currency}`)
            return { valid: false, error: 'Valuta non valida', code: 'INVALID_CURRENCY' }
        }

        if (Math.abs(paidAmount - expectedAmount) > 0.01) {
            console.error(`[complete-purchase] Importo: ${paidAmount}, atteso: ${expectedAmount}`)
            return { valid: false, error: 'Importo non corrispondente', code: 'AMOUNT_MISMATCH' }
        }

        return { valid: true }

    } catch (error) {
        console.error('[complete-purchase] Errore verifica PayPal:', error)
        return { valid: false, error: 'Errore verifica pagamento', code: 'VERIFICATION_ERROR' }
    }
}

/**
 * POST /api/complete-purchase
 * 
 * Completa l'acquisto dopo pagamento PayPal.
 * Autenticazione via Bearer token.
 */
export async function POST(request: NextRequest) {
    try {
        if (!PAYMENTS_ENABLED) {
            return NextResponse.json(
                { ok: false, error: 'payments_disabled' },
                { status: 503 }
            )
        }

        // Auth via Bearer token
        const authHeader = request.headers.get('authorization') || ''

        if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
            console.error('[complete-purchase] Token mancante')
            return NextResponse.json(
                { ok: false, error: 'missing_token' },
                { status: 401 }
            )
        }

        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        const { data: { user }, error: authError } = await getSupabaseAdmin().auth.getUser(token)

        if (authError || !user) {
            console.error('[complete-purchase] Token invalido:', authError?.message)
            return NextResponse.json(
                { ok: false, error: 'invalid_token' },
                { status: 401 }
            )
        }

        // Parsing body
        const body = await request.json()
        const { orderId, level } = body

        if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
            return NextResponse.json(
                { ok: false, error: 'missing_order_id' },
                { status: 400 }
            )
        }

        if (!PAYPAL_ORDER_ID_REGEX.test(orderId)) {
            return NextResponse.json(
                { ok: false, error: 'invalid_order_id_format' },
                { status: 400 }
            )
        }

        // RATE LIMITING (Package 2)
        // import { checkRateLimit } from '@/lib/rateLimit' <--- Spostato sopra
        const ip = request.headers.get('x-forwarded-for') || 'unknown'

        // Limit 1: User-based (5 requests / minute)
        const userLimit = await checkRateLimit(`purchase_user_${user.id}`, 5, 60)
        if (!userLimit.success) {
            console.warn(`[RateLimit] User ${user.id} exceeded limit`)
            return NextResponse.json({ ok: false, error: 'rate_limit_exceeded' }, { status: 429 })
        }

        // Limit 2: IP-based (10 requests / minute)
        const ipLimit = await checkRateLimit(`purchase_ip_${ip}`, 10, 60)
        if (!ipLimit.success) {
            console.warn(`[RateLimit] IP ${ip} exceeded limit`)
            return NextResponse.json({ ok: false, error: 'rate_limit_exceeded' }, { status: 429 })
        }

        if (!level || !['Base', 'Intermedio', 'Avanzato'].includes(level)) {
            return NextResponse.json(
                { ok: false, error: 'invalid_level' },
                { status: 400 }
            )
        }

        const expectedAmount = getExpectedPrice(level)
        if (expectedAmount === null) {
            return NextResponse.json(
                { ok: false, error: 'price_not_found' },
                { status: 500 }
            )
        }

        // Idempotenza
        const { data: existingPurchase } = await getSupabaseAdmin()
            .from('purchases')
            .select('id')
            .eq('paypal_order_id', orderId)
            .maybeSingle()

        if (existingPurchase) {
            console.log(`[complete-purchase] Ordine ${orderId} già processato`)
            return NextResponse.json({ ok: true, alreadyProcessed: true })
        }

        // Verifica ToS
        const { data: tosAcceptance } = await getSupabaseAdmin()
            .from('tos_acceptances')
            .select('id')
            .eq('user_id', user.id)
            .eq('tos_version', TOS_VERSION)
            .maybeSingle()

        if (!tosAcceptance) {
            return NextResponse.json(
                { ok: false, error: 'tos_not_accepted' },
                { status: 403 }
            )
        }

        // Verifica PayPal
        const verification = await verifyPayPalOrder(orderId, expectedAmount)

        if (!verification.valid) {
            return NextResponse.json(
                { ok: false, error: verification.error, code: verification.code },
                { status: 402 }
            )
        }

        // Ottieni corsi
        const allCourses = getAllCourses()
        const coursesToUnlock = allCourses.filter(c => c.level === level)

        if (coursesToUnlock.length === 0) {
            return NextResponse.json(
                { ok: false, error: 'no_courses_found' },
                { status: 500 }
            )
        }

        // Salva acquisti
        const purchaseRecords = coursesToUnlock.map(course => ({
            user_id: user.id,
            course_id: course.title,
            amount: expectedAmount / coursesToUnlock.length,
            paypal_order_id: orderId
        }))

        const { error: purchaseError } = await getSupabaseAdmin()
            .from('purchases')
            .insert(purchaseRecords)

        if (purchaseError) {
            if (purchaseError.code === '23505') {
                console.log(`[complete-purchase] Ordine ${orderId} già presente (constraint)`)
                return NextResponse.json({ ok: true, alreadyProcessed: true })
            }

            console.error('[complete-purchase] Errore insert:', purchaseError)
            return NextResponse.json(
                { ok: false, error: 'purchase_error' },
                { status: 500 }
            )
        }

        console.log(`[complete-purchase] Ordine ${orderId} completato: ${coursesToUnlock.length} corsi per user ${user.id}`)

        // Check if user has P.IVA and send invoice notification email
        try {
            const { data: userProfile } = await getSupabaseAdmin()
                .from('user_profiles')
                .select('company_name, piva, address, city, cap, cf')
                .eq('id', user.id)
                .maybeSingle()

            if (userProfile?.piva) {
                // Send email notification for invoice via EmailJS API
                const emailData = {
                    service_id: 'service_i4y7ewt',
                    template_id: 'template_sotc25n',
                    user_id: 'NcJg5-hiu3gVJiJZ-',
                    template_params: {
                        from_name: 'Sistema Acquisti',
                        from_email: user.email,
                        subject: `🧾 FATTURA RICHIESTA - Ordine ${orderId}`,
                        message: `
NUOVO ACQUISTO CON P.IVA - SERVE FATTURA

📦 ORDINE: ${orderId}
📚 LIVELLO: ${level}
💰 IMPORTO: €${expectedAmount.toFixed(2)}

👤 DATI CLIENTE:
Email: ${user.email}
Ragione Sociale: ${userProfile.company_name || 'N/D'}
P.IVA: ${userProfile.piva}
Codice Fiscale: ${userProfile.cf || 'N/D'}
Indirizzo: ${userProfile.address || 'N/D'}
CAP: ${userProfile.cap || 'N/D'}
Città: ${userProfile.city || 'N/D'}

⏰ Data: ${new Date().toLocaleString('it-IT')}
                        `.trim()
                    }
                }

                await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(emailData)
                })

                console.log(`[complete-purchase] Email fattura inviata per ordine ${orderId}`)
            }
        } catch (emailError) {
            console.error('[complete-purchase] Errore invio email fattura:', emailError)
        }

        // Send confirmation email to the CUSTOMER
        try {
            // Determine friendly package name
            let packageName = `Pacchetto ${level}`
            if (level.toLowerCase() === 'base') packageName = 'Pacchetto BASE (9 Video)'
            else if (level.toLowerCase() === 'intermedio') packageName = 'Pacchetto INTERMEDIO (9 Video)'
            else if (level.toLowerCase() === 'avanzato') packageName = 'Pacchetto AVANZATO (9 Video)'
            // Fallback for unexpected levels
            else packageName = `Pacchetto ${level}`

            const customerEmailData = {
                service_id: 'service_i4y7ewt',
                template_id: 'template_sotc25n', // Correct customer template
                user_id: 'NcJg5-hiu3gVJiJZ-',
                template_params: {
                    from_name: 'Simon Silver Caldaie', // Sender name
                    to_email: user.email,
                    subject: `✅ Conferma Acquisto - ${level}`,
                    message: `
Ciao! Grazie per il tuo acquisto.

Hai sbloccato con successo:
${packageName}

Puoi accedere subito ai tuoi corsi dalla Dashboard:
https://simonsilvercaldaie.it/dashboard

Buono studio!
Simon Silver
                    `.trim()
                }
            }

            // Note: If the template is fixed to send to Simon, this email will go to Simon.
            // There is no way to fix this via code only if EmailJS is locked to one recipient.
            // I will implement it and warn the user.

            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerEmailData)
            })

        } catch (confError) {
            console.error('[complete-purchase] Errore invio conferma:', confError)
        }

        return NextResponse.json({
            ok: true,
            alreadyProcessed: false,
            level: level,
            coursesUnlocked: coursesToUnlock.length,
            environment: PAYPAL_ENV
        })

    } catch (error) {
        console.error('[complete-purchase] Errore interno:', error)
        return NextResponse.json(
            { ok: false, error: 'internal_error' },
            { status: 500 }
        )
    }
}
