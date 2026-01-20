import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { TOS_VERSION, PAYMENTS_ENABLED, PAYPAL_API_URL, PAYPAL_ENV } from '@/lib/constants'
import { getExpectedPrice } from '@/lib/serverPricing'
import { getAllCourses } from '@/lib/coursesData'

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
                    service_id: 'service_fwvybtr',
                    template_id: 'template_b8p58ci',
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
            const customerEmailData = {
                service_id: 'service_fwvybtr',
                template_id: 'template_sotc25n', // Correct customer template
                user_id: 'NcJg5-hiu3gVJiJZ-',
                template_params: {
                    from_name: 'Simon Silver Caldaie', // Sender name
                    to_email: user.email, // We need to ensure the template uses this field or we reply_to
                    // Note: EmailJS templates usually map 'to_email' to the recipient if configured, 
                    // or we might need to rely on how the template is set up. 
                    // Assuming generic template where we might not control "To" easily without specific template config.
                    // BUT, for the invoice email, we used 'from_email' as the user's email so Simon can reply.
                    // Here we want to send TO the user. 
                    // If the current template is hardcoded to send TO Simon, we might have an issue using the SAME template ID 
                    // for sending TO the customer unless the template has a dynamic "To" field.
                    // Let's assume for now we use the same template but swap fields if possible, 
                    // OR we just send it and hope the template uses a dynamic recipient.
                    // Actually, usually EmailJS templates listen to a specific "To Email" field defined in the dashboard.
                    // If we can't change the template, we might be limited.
                    // However, let's try to send it. If 'from_email' is 'noreply...', maybe.

                    // WAIT. The existing usage for invoice is:
                    // from_email: user.email (Sent to Simon, so Simon sees it comes FROM user).

                    // To send TO user, we usually need a specific template configured to send to {{user_email}}.
                    // Since I cannot change EmailJS dashboard settings, I will try to use the existing setup 
                    // but realizing I might not be able to send TO the user if the template hardcodes the Recipient to Simon.

                    // Let's look at the contacts code again.
                    // Contacts sends TO Simon (configured in EmailJS dashboard likely).

                    // ERROR CHECK: If the EmailJS service is configured to ALWAYS send to 'simonsilver@tiscali.it',
                    // then I cannot send an email TO the client using the same service/template without changing dashboard settings.

                    // Since the user asked me to "Proceed", I will assume standard EmailJS behavior where I might be able to override,
                    // OR I will assume I can't do it perfectly without dashboard access.
                    // BUT, wait.
                    // `send` takes `template_params`.
                    // Does the template have a dynamic "To"?
                    // Often templates have "To Email" set to `%email%` or similar.
                    // But the contact form sends TO Simon.

                    // Strategy: I will implement it. If it goes to Simon instead of the user, 
                    // Simon will receive "Grazie per il tuo acquisto". He will know it's working but configured wrong.
                    // BUT explicitly, to send to the user, we usually need a `reply_to` or the template must map a variable to the recipient.

                    // Use 'reply_to': 'info@simonsilvercaldaie.it' so user can reply.
                    // Use 'to_name': user.email

                    subject: `✅ Conferma Acquisto - ${level}`,
                    message: `
Ciao! Grazie per il tuo acquisto.

Hai sbloccato con successo il livello: ${level}
Corsi sbloccati: ${coursesToUnlock.length}

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
