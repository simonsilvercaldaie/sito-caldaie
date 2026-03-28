import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PAYPAL_API_URL } from '@/lib/constants'
import { grantAccessForProduct } from '@/lib/accessControl'
import { sendEmail, EmailType } from '@/lib/email'
import { getExpectedPriceCents } from '@/lib/serverPricing'
import { createInvoiceIfEnabled, BillingData } from '@/lib/fattureincloud'

// Max invites per product type
const PRODUCT_MAX_INVITES: Record<string, number> = {
    'multi_5': 10,
    'multi_10': 20,
    'multi_25': 50,
    'scuola_10': 20,
}

// -------------------------------------------------------------------
// PayPal Webhook Handler — Safety net for purchase flow
//
// Listens for CHECKOUT.ORDER.COMPLETED events.
// If the client flow already processed the purchase, this is a no-op
// (idempotent on paypal_capture_id UNIQUE constraint).
// If the client flow crashed/failed, this picks up and completes
// the purchase + grant + email server-side.
// -------------------------------------------------------------------

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

async function getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID_SERVER || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET
    if (!clientId || !clientSecret) throw new Error('PayPal credentials not configured')

    const res = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    })
    if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`)
    const data = await res.json()
    return data.access_token
}

// -------------------------------------------------------------------
// VERIFY WEBHOOK SIGNATURE via PayPal API
// -------------------------------------------------------------------
async function verifyWebhookSignature(req: NextRequest, body: string): Promise<boolean> {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (!webhookId) {
        console.error('[webhook-paypal] PAYPAL_WEBHOOK_ID not configured')
        return false
    }

    const headers = {
        'PAYPAL-AUTH-ALGO': req.headers.get('paypal-auth-algo') || '',
        'PAYPAL-CERT-URL': req.headers.get('paypal-cert-url') || '',
        'PAYPAL-TRANSMISSION-ID': req.headers.get('paypal-transmission-id') || '',
        'PAYPAL-TRANSMISSION-SIG': req.headers.get('paypal-transmission-sig') || '',
        'PAYPAL-TRANSMISSION-TIME': req.headers.get('paypal-transmission-time') || '',
    }

    // Check all required headers exist
    const missingHeaders = Object.entries(headers).filter(([, v]) => !v)
    if (missingHeaders.length > 0) {
        console.error(`[webhook-paypal] Missing headers: ${missingHeaders.map(([k]) => k).join(', ')}`)
        return false
    }

    try {
        const accessToken = await getPayPalAccessToken()

        const verifyPayload = {
            auth_algo: headers['PAYPAL-AUTH-ALGO'],
            cert_url: headers['PAYPAL-CERT-URL'],
            transmission_id: headers['PAYPAL-TRANSMISSION-ID'],
            transmission_sig: headers['PAYPAL-TRANSMISSION-SIG'],
            transmission_time: headers['PAYPAL-TRANSMISSION-TIME'],
            webhook_id: webhookId,
            webhook_event: JSON.parse(body)
        }

        const res = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(verifyPayload)
        })

        if (!res.ok) {
            const errText = await res.text()
            console.error(`[webhook-paypal] Signature verification API error: ${res.status} ${errText}`)
            return false
        }

        const result = await res.json()
        const verified = result.verification_status === 'SUCCESS'
        if (!verified) {
            console.error(`[webhook-paypal] Signature INVALID: ${result.verification_status}`)
        }
        return verified

    } catch (e) {
        console.error('[webhook-paypal] Signature verification exception:', e)
        return false
    }
}

// -------------------------------------------------------------------
// Determine email type from product_code
// -------------------------------------------------------------------
function getEmailType(productCode: string): EmailType | null {
    if (productCode.startsWith('multi_') || productCode.startsWith('scuola_') || productCode.startsWith('extra_invito_')) {
        return 'ACQUISTO_TEAM'
    }
    if (productCode.includes('base')) return 'ACQUISTO_BASE'
    if (productCode.includes('intermedi') || productCode === 'intermediate') return 'ACQUISTO_INTERMEDIO'
    if (productCode.includes('avanzat') || productCode === 'advanced') return 'ACQUISTO_AVANZATO'
    if (productCode.includes('complete')) return 'ACQUISTO_BASE' // Complete bundles get base email type
    return null
}

// -------------------------------------------------------------------
// MAIN WEBHOOK HANDLER
// -------------------------------------------------------------------
export async function POST(request: NextRequest) {
    const body = await request.text()

    // 1. Verify webhook signature
    const isValid = await verifyWebhookSignature(request, body)
    if (!isValid) {
        console.error('[webhook-paypal] REJECTED: Invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    let event: any
    try {
        event = JSON.parse(body)
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const eventType = event.event_type
    console.log(`[webhook-paypal] Received event: ${eventType}, id: ${event.id}`)

    // 2. Only process CHECKOUT.ORDER.COMPLETED
    if (eventType !== 'CHECKOUT.ORDER.COMPLETED') {
        // Acknowledge but ignore other event types
        console.log(`[webhook-paypal] Ignoring event type: ${eventType}`)
        return NextResponse.json({ ok: true, ignored: true })
    }

    // 3. Extract purchase data
    const order = event.resource
    if (!order) {
        console.error('[webhook-paypal] No resource in event')
        return NextResponse.json({ error: 'No resource' }, { status: 400 })
    }

    const orderId = order.id
    const purchaseUnit = order.purchase_units?.[0]
    const capture = purchaseUnit?.payments?.captures?.[0]

    if (!capture) {
        console.error(`[webhook-paypal] No capture found in order ${orderId}`)
        return NextResponse.json({ error: 'No capture' }, { status: 400 })
    }

    const captureId = capture.id
    const customId = purchaseUnit?.custom_id // product_code embedded by frontend
    const payerEmail = order.payer?.email_address

    console.log(`[webhook-paypal] Processing: orderId=${orderId}, captureId=${captureId}, customId=${customId}, payer=${payerEmail}`)

    if (!customId) {
        console.error(`[webhook-paypal] No custom_id in order ${orderId} — cannot determine product_code`)
        // Still return 200 to prevent PayPal from retrying
        return NextResponse.json({ ok: true, skipped: true, reason: 'no_custom_id' })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // 4. Idempotency check — if purchase already recorded, exit clean
    const { data: existing } = await supabaseAdmin
        .from('purchases')
        .select('id')
        .eq('paypal_capture_id', captureId)
        .maybeSingle()

    if (existing) {
        console.log(`[webhook-paypal] Already processed: captureId=${captureId}`)
        return NextResponse.json({ ok: true, alreadyProcessed: true })
    }

    // 5. Find the buyer by payer email
    // Search profiles table (scalable — works with any number of users)
    const { data: profileData, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', payerEmail)
        .maybeSingle()

    if (profileErr) {
        console.error('[webhook-paypal] Profile lookup error:', profileErr)
        return NextResponse.json({ error: 'Failed to find user' }, { status: 500 })
    }

    // Fallback: try auth admin getUserByEmail if not in profiles
    let userId: string | null = profileData?.id || null
    let userEmail: string | null = payerEmail || null

    if (!userId && payerEmail) {
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
        const foundUser = authData?.users?.find(u => u.email === payerEmail)
        if (foundUser) {
            userId = foundUser.id
            userEmail = foundUser.email || payerEmail
        }
    }

    if (!userId) {
        console.error(`[webhook-paypal] No user found for payer email: ${payerEmail}`)
        // Don't fail — log for manual resolution
        return NextResponse.json({ ok: true, skipped: true, reason: 'user_not_found' })
    }

    // Create a user-like object for compatibility
    const user = { id: userId, email: userEmail }

    // 6. Determine product details from custom_id
    const productCode = customId
    const paidAmountCents = Math.round(parseFloat(capture.amount?.value || '0') * 100)
    
    // Determine plan_type
    const isTeam = productCode.startsWith('multi_') || productCode.startsWith('scuola_')
    const isExtraInvites = productCode.startsWith('extra_invito_')
    const planType = isTeam || isExtraInvites ? 'team' : 'individual'

    // 7. Validate price
    const expectedPriceCents = getExpectedPriceCents(productCode)
    if (expectedPriceCents && Math.abs(paidAmountCents - expectedPriceCents) > 1) {
        console.error(`[webhook-paypal] Price mismatch: paid=${paidAmountCents}, expected=${expectedPriceCents}, product=${productCode}`)
        return NextResponse.json({ ok: true, skipped: true, reason: 'price_mismatch' })
    }

    // 8. Fetch billing profile
    const { data: billing } = await supabaseAdmin
        .from('billing_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

    const snapshotData = {
        snapshot_company_name: billing?.company_name || null,
        snapshot_vat_number: billing?.vat_number || null,
        snapshot_sdi_code: billing?.sdi_code || null,
        snapshot_fiscal_code: billing?.fiscal_code || null,
        snapshot_address: billing?.address || null,
        snapshot_city: billing?.city || null,
        snapshot_postal_code: billing?.postal_code || null
    }

    try {
        // 9. Process based on product type
        let webhookPurchaseId: string | undefined = undefined

        if (isExtraInvites) {
            // Find existing team license
            const { data: existingLicense } = await supabaseAdmin
                .from('team_licenses')
                .select('id, max_invites_total')
                .eq('owner_user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (!existingLicense) {
                console.error(`[webhook-paypal] No team license for user ${user.email} (extra invites)`)
                return NextResponse.json({ ok: true, skipped: true, reason: 'no_team_license' })
            }

            const extraInvites = parseInt(productCode.split('_')[2]) || 1
            const newMaxInvites = (existingLicense.max_invites_total || 0) + extraInvites

            await supabaseAdmin
                .from('team_licenses')
                .update({ max_invites_total: newMaxInvites })
                .eq('id', existingLicense.id)

            const { data: extraPurchaseRow, error: purErr } = await supabaseAdmin.from('purchases').insert({
                user_id: user.id,
                plan_type: 'team',
                product_code: productCode,
                amount_cents: paidAmountCents,
                paypal_order_id: orderId,
                paypal_capture_id: captureId,
                team_license_id: existingLicense.id,
                ...snapshotData
            }).select('id').single()
            if (purErr) {
                if (purErr.code === '23505') return NextResponse.json({ ok: true, alreadyProcessed: true })
                throw purErr
            }
            webhookPurchaseId = extraPurchaseRow?.id

        } else if (isTeam) {
            // Create team license
            const seatsFromCode = parseInt(productCode.split('_')[1])
            const seats = seatsFromCode + 1

            const { data: lic, error: licErr } = await supabaseAdmin.from('team_licenses').insert({
                owner_user_id: user.id,
                seats: seats,
                company_name: billing?.company_name || user.email,
                max_invites_total: PRODUCT_MAX_INVITES[productCode] || (seatsFromCode * 2)
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
                product_code: productCode,
                amount_cents: paidAmountCents,
                paypal_order_id: orderId,
                paypal_capture_id: captureId,
                team_license_id: lic.id,
                ...snapshotData
            }).select('id').single()

            if (purErr) {
                if (purErr.code === '23505') return NextResponse.json({ ok: true, alreadyProcessed: true })
                throw purErr
            }

            await grantAccessForProduct(user.id, productCode, 'team', purchaseRow.id, lic.id)
            webhookPurchaseId = purchaseRow.id

        } else {
            // Individual purchase
            const { data: purchaseRow, error: purErr } = await supabaseAdmin.from('purchases').insert({
                user_id: user.id,
                plan_type: 'individual',
                product_code: productCode,
                amount_cents: paidAmountCents,
                paypal_order_id: orderId,
                paypal_capture_id: captureId,
                team_license_id: null,
                ...snapshotData
            }).select('id').single()

            if (purErr) {
                if (purErr.code === '23505') return NextResponse.json({ ok: true, alreadyProcessed: true })
                throw purErr
            }

            await grantAccessForProduct(user.id, productCode, 'purchase', purchaseRow.id)
            webhookPurchaseId = purchaseRow.id
        }

        // 10. Send confirmation email (non-blocking)
        const emailType = getEmailType(productCode)
        if (emailType && user.email) {
            sendEmail(emailType, { to_email: user.email })
                .catch(e => console.error('[webhook-paypal] Email error:', e))
        }

        // 11. Async Invoice via Fatture in Cloud (FIRE AND FORGET)
        if (billing && billing.customer_type === 'company' && billing.vat_number) {
            const billingForFic = billing as unknown as BillingData
            createInvoiceIfEnabled(
                billingForFic,
                user.email!,
                productCode,
                paidAmountCents,
                captureId,
                webhookPurchaseId
            ).catch(e => console.error('[webhook-paypal] FIC Invoice Error:', e));
        }

        console.log(`[webhook-paypal] SUCCESS: user=${user.email}, product=${productCode}, capture=${captureId}`)
        return NextResponse.json({ ok: true, processed: true })

    } catch (e) {
        console.error(`[webhook-paypal] CRITICAL ERROR processing ${captureId}:`, e)
        // Return 500 so PayPal retries
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
}
