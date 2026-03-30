import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { TOS_VERSION, SERVER_PAYMENTS_ENABLED, PAYPAL_API_URL } from '@/lib/constants'
import { getExpectedPriceCents } from '@/lib/serverPricing'
import { checkRateLimit } from '@/lib/rateLimit'
import { sendEmail, EmailType } from '@/lib/email'
import { grantAccessForProduct } from '@/lib/accessControl'
import { createInvoiceIfEnabled, BillingData } from '@/lib/fattureincloud'

// Max invites per product type
const PRODUCT_MAX_INVITES: Record<string, number> = {
    'multi_5': 10,
    'multi_10': 20,
    'multi_25': 50,
    'scuola_10': 20,
}

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
        const supabaseAdminFast = getSupabaseAdmin()
        const rawBody = await request.text()
        let parsedBody = null
        try { parsedBody = JSON.parse(rawBody) } catch(e){}
        await supabaseAdminFast.from('security_events').insert({
            event_type: 'DEBUG_API_INCOMING',
            metadata: { body: parsedBody, raw: rawBody, url: request.url, headers: Object.fromEntries(request.headers.entries()) },
            ip_address: '0.0.0.0'
        })
        
        // Re-construct the request to not consume the body
        // removed requestWithBody

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

        if (!parsedBody) return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
        const body = parsedBody
        const { orderId, product_code, amount_cents } = body

        console.log(`[complete-purchase] START: email=${user.email}, orderId=${orderId}, product_code=${product_code}, amount_cents=${amount_cents}`)

        if (!orderId || !product_code || !amount_cents) {
            console.log(`[complete-purchase] FAIL: missing_fields orderId=${orderId} product_code=${product_code} amount_cents=${amount_cents}`)
            return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 })
        }

        // 3. Price Validation (SERVER TRUTH)
        let truthPrice = 0
        try {
            truthPrice = getExpectedPriceCents(product_code)
        } catch (e) {
            console.log(`[complete-purchase] FAIL: invalid_product_code=${product_code}`)
            return NextResponse.json({ ok: false, error: 'invalid_product_code' }, { status: 400 })
        }

        // TEST ACCOUNT BYPASS: Override price for test emails
        const TEST_EMAILS_CENTS: Record<string, number> = {
            'simonsilvercaldaie@gmail.com': 100,     // 1 EUR
            'simonsilvermotocross@gmail.com': 100,    // 1 EUR
            'simonsilvermocross@gmail.com': 100,      // 1 EUR a volte sbagli a scriverlo ;)
        }
        const isTestAccount = user.email && TEST_EMAILS_CENTS[user.email] !== undefined
        if (isTestAccount) {
            truthPrice = TEST_EMAILS_CENTS[user.email!]
            console.log(`[complete-purchase] TEST ACCOUNT: overriding truthPrice to ${truthPrice}`)
        }

        // Security Check: Client vs Server amount
        if (amount_cents !== truthPrice) {
            console.log(`[complete-purchase] FAIL: price_mismatch client=${amount_cents} server=${truthPrice}`)
            return NextResponse.json({ ok: false, error: 'price_mismatch' }, { status: 400 })
        }

        // 4. Rate Limit
        const limitRes = await checkRateLimit(`purch_${user.id}`, 5, 60, false)
        if (!limitRes.success) {
            console.log(`[complete-purchase] FAIL: rate_limit for user ${user.id}`)
            return NextResponse.json({ ok: false, error: 'rate_limit' }, { status: 429 })
        }

        // 5. TOS (skip for test accounts)
        if (!isTestAccount) {
            const { data: tos } = await supabaseAdmin.from('tos_acceptances').select('id').eq('user_id', user.id).eq('tos_version', TOS_VERSION).maybeSingle()
            if (!tos) {
                console.log(`[complete-purchase] FAIL: tos_required for user ${user.id}`)
                return NextResponse.json({ ok: false, error: 'tos_required' }, { status: 403 })
            }
        } else {
            console.log(`[complete-purchase] TEST ACCOUNT: skipping TOS check`)
        }

        // 5b. Profile Completion Check (skip for test accounts)
        if (!isTestAccount) {
            const { data: profileData } = await supabaseAdmin.from('profiles').select('profile_completed').eq('id', user.id).maybeSingle()
            if (!profileData?.profile_completed) {
                console.log(`[complete-purchase] FAIL: profile_incomplete for user ${user.id}`)
                return NextResponse.json({ ok: false, error: 'profile_incomplete' }, { status: 403 })
            }
        } else {
            console.log(`[complete-purchase] TEST ACCOUNT: skipping profile check`)
        }

        // 6. Verify PayPal
        console.log(`[complete-purchase] Verifying PayPal order ${orderId} with truthPrice=${truthPrice}`)
        const ver = await verifyPayPalOrder(orderId, truthPrice, user.id)
        if (!ver.valid || !ver.captureId) {
            console.log(`[complete-purchase] FAIL: PayPal verify failed: ${ver.error}`)
            return NextResponse.json({ ok: false, error: ver.error }, { status: 402 })
        }
        const captureId = ver.captureId
        console.log(`[complete-purchase] PayPal verified OK, captureId=${captureId}`)

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
        const isTeam = product_code.startsWith('multi_') || product_code.startsWith('scuola_')
        const isExtraInvites = product_code.startsWith('extra_invito_')
        let purchaseIdForInvoice: string | undefined = undefined

        // 8b. BUNDLE GUARD: block complete_bundle if user already has any access
        if (product_code === 'complete_bundle' || product_code === 'complete') {
            const { data: existingPurchases } = await supabaseAdmin
                .from('purchases')
                .select('product_code')
                .eq('user_id', user.id)
            
            if (existingPurchases && existingPurchases.length > 0) {
                const codes = existingPurchases.map(p => p.product_code?.toLowerCase())
                const hasAnySingle = codes.some(c => c === 'base' || c === 'intermediate' || c === 'advanced')
                const hasComplete = codes.some(c => c?.includes('complete'))
                const hasMulti = codes.some(c => c?.startsWith('multi_') || c?.startsWith('scuola_'))
                
                if (hasAnySingle || hasComplete || hasMulti) {
                    console.log(`[complete-purchase] BLOCKED: bundle not allowed, user already has: ${codes.join(', ')}`)
                    return NextResponse.json({ ok: false, error: 'bundle_not_allowed' }, { status: 400 })
                }
            }
        }

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

        if (isExtraInvites) {
            // --- RAMO EXTRA INVITI ---
            // Trova la licenza team esistente dell'utente
            const { data: existingLicense, error: findErr } = await supabaseAdmin
                .from('team_licenses')
                .select('id, max_invites_total, invites_used')
                .eq('owner_user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (findErr || !existingLicense) {
                return NextResponse.json({ ok: false, error: 'no_team_license_found' }, { status: 400 })
            }

            // Aggiungi inviti: extra_invito_1 → +1 invito totale
            const extraInvites = parseInt(product_code.split('_')[2]) || 1
            const newMaxInvites = (existingLicense.max_invites_total || 0) + extraInvites

            await supabaseAdmin
                .from('team_licenses')
                .update({ max_invites_total: newMaxInvites })
                .eq('id', existingLicense.id)

            // Registra acquisto
            const { data: extraPurchaseRow, error: purErr } = await supabaseAdmin.from('purchases').insert({
                user_id: user.id,
                plan_type: 'team',
                product_code: product_code,
                amount_cents: truthPrice,
                paypal_order_id: orderId,
                paypal_capture_id: captureId,
                team_license_id: existingLicense.id,
                ...snapshotData
            }).select('id').single()
            if (purErr) {
                if (purErr.code === '23505') return NextResponse.json({ ok: true, alreadyProcessed: true })
                throw purErr
            }
            purchaseIdForInvoice = extraPurchaseRow?.id

        } else if (isTeam) {
            // --- RAMO TEAM ---
            // Il numero nel product_code (es. multi_5) indica i posti invitabili
            // +1 per includere anche l'admin come membro
            const seatsFromCode = parseInt(product_code.split('_')[1])
            const seats = seatsFromCode + 1

            const { data: lic, error: licErr } = await supabaseAdmin.from('team_licenses').insert({
                owner_user_id: user.id,
                seats: seats,
                company_name: billing?.company_name || user.email,
                max_invites_total: PRODUCT_MAX_INVITES[product_code] || (seatsFromCode * 2)
            }).select().single()

            if (licErr || !lic) throw licErr

            const { error: memErr } = await supabaseAdmin.from('team_members').insert({
                team_license_id: lic.id,
                user_id: user.id
            })
            if (memErr) throw memErr

            const { data: purchaseRow, error: purErr } = await supabaseAdmin.from('purchases').insert({
                user_id: user.id,
                plan_type: 'team',
                product_code: product_code,
                amount_cents: truthPrice,
                paypal_order_id: orderId,
                paypal_capture_id: captureId,
                team_license_id: lic.id,
                ...snapshotData
            }).select('id').single()
            if (purErr) {
                if (purErr.code === '23505') return NextResponse.json({ ok: true, alreadyProcessed: true })
                throw purErr
            }

            // Grant access levels for team owner
            await grantAccessForProduct(user.id, product_code, 'team', purchaseRow.id, lic.id)
            purchaseIdForInvoice = purchaseRow.id

        } else {
            // --- RAMO INDIVIDUAL ---
            const { data: purchaseRow, error: purErr } = await supabaseAdmin.from('purchases').insert({
                user_id: user.id,
                plan_type: 'individual',
                product_code: product_code,
                amount_cents: truthPrice,
                paypal_order_id: orderId,
                paypal_capture_id: captureId,
                team_license_id: null,
                ...snapshotData
            }).select('id').single()
            if (purErr) {
                if (purErr.code === '23505') return NextResponse.json({ ok: true, alreadyProcessed: true })
                throw purErr
            }

            // Grant access levels for individual purchase
            await grantAccessForProduct(user.id, product_code, 'purchase', purchaseRow.id)
            purchaseIdForInvoice = purchaseRow.id
        }

        // 8.1 Send Confirmation Email SERVER-SIDE
        let emailType: EmailType | null = null

        if (isTeam || isExtraInvites) {
            emailType = 'ACQUISTO_TEAM'
        } else if (product_code === 'complete' || product_code === 'complete_bundle') {
            emailType = 'ACQUISTO_BASE' // Complete purchases get base welcome email
        } else if (product_code.includes('base')) {
            emailType = 'ACQUISTO_BASE'
        } else if (product_code === 'intermediate' || product_code.includes('intermedio')) {
            emailType = 'ACQUISTO_INTERMEDIO'
        } else if (product_code === 'advanced' || product_code.includes('avanzato')) {
            emailType = 'ACQUISTO_AVANZATO'
        }

        // Send confirmation email server-side (AWAIT — must complete before response)
        if (emailType && user.email) {
            try {
                await sendEmail(emailType, { to_email: user.email })
                console.log(`[complete-purchase] Confirmation email sent: ${emailType} to ${user.email}`)
            } catch (e) {
                console.error('[complete-purchase] Confirmation Email Error:', e)
            }
        }

        // 9. Invoice via Fatture in Cloud (AWAIT — must complete before response)
        // On Vercel serverless, fire-and-forget gets killed when the response is sent.
        // We MUST await this call to ensure the invoice is actually created.
        let ficResult: any = null
        if (billing) {
            const billingForFic = billing as BillingData
            try {
                ficResult = await createInvoiceIfEnabled(
                    billingForFic,
                    user.email!,
                    product_code,
                    truthPrice,
                    captureId,
                    purchaseIdForInvoice
                )
                console.log(`[complete-purchase] FIC result:`, JSON.stringify(ficResult))
            } catch (e) {
                console.error('[complete-purchase] FIC Invoice Error:', e)
            }
        } else {
            console.warn(`[complete-purchase] No billing profile found for user ${user.id} — skipping invoice`)
        }

        return NextResponse.json({
            ok: true,
            emailType,
            email: user.email,
            invoiceCreated: ficResult?.success || false
        })

    } catch (e) {
        console.error('Internal Error', e)
        return NextResponse.json({ ok: false, error: 'internal_server_error' }, { status: 500 })
    }
}
