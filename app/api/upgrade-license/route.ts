import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { PAYPAL_API_URL } from '@/lib/constants'

// Service Role Client
// Service Role Client
// Removed top level init


// PayPal Config — uses PAYPAL_API_URL from constants.ts for consistency

// Expected upgrade prices in cents
const UPGRADE_PRICES: Record<string, number> = {
    'individual_to_multi_5': 200000,    // 3000 - 1000 = 2000€
    'individual_to_multi_10': 300000,   // 4000 - 1000 = 3000€
    'individual_to_multi_25': 400000,   // 5000 - 1000 = 4000€
    'multi_5_to_multi_10': 100000,      // 4000 - 3000 = 1000€
    'multi_5_to_multi_25': 200000,      // 5000 - 3000 = 2000€
    'multi_10_to_multi_25': 100000,     // 5000 - 4000 = 1000€
}

async function getPayPalAccessToken(): Promise<string> {
    const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')

    const res = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    })

    const data = await res.json()
    return data.access_token
}

async function verifyPayPalOrder(orderId: string, expectedAmountCents: number): Promise<{ valid: boolean, captureId?: string }> {
    try {
        const accessToken = await getPayPalAccessToken()

        const res = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!res.ok) {
            console.error(`[upgrade-license] PayPal API returned ${res.status}`)
            return { valid: false }
        }

        const order = await res.json()
        console.log(`[upgrade-license] PayPal order status: ${order.status}, id: ${orderId}`)

        if (order.status !== 'COMPLETED') {
            console.error(`[upgrade-license] Order not COMPLETED, status: ${order.status}`)
            return { valid: false }
        }

        const capture = order.purchase_units?.[0]?.payments?.captures?.[0]
        if (!capture) {
            console.error('[upgrade-license] No capture found in order')
            return { valid: false }
        }

        const paidAmountCents = Math.round(parseFloat(capture.amount.value) * 100)
        console.log(`[upgrade-license] Paid: ${paidAmountCents} cents, Expected: ${expectedAmountCents} cents`)

        // Allow small variance (€2)
        if (Math.abs(paidAmountCents - expectedAmountCents) > 200) {
            console.error(`[upgrade-license] Price mismatch: paid ${paidAmountCents}, expected ${expectedAmountCents}`)
            return { valid: false }
        }

        return { valid: true, captureId: capture.id }
    } catch (err) {
        console.error('[upgrade-license] PayPal verification error:', err)
        return { valid: false }
    }
}

export async function POST(request: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    try {
        // 1. Auth Check
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const token = authHeader.replace('Bearer ', '')

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // 2. Rate Limit
        const limitRes = await checkRateLimit(`upgrade_${user.id}`, 5, 3600, false)
        if (!limitRes.success) {
            return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429 })
        }

        // 3. Parse body
        const body = await request.json()
        const { orderId, target_team_size, upgrade_price_cents, from_status } = body

        if (!orderId || !target_team_size || !upgrade_price_cents || !from_status) {
            return NextResponse.json({ error: 'missing_params' }, { status: 400 })
        }

        // 4. Determine upgrade key and validate price
        let upgradeKey = ''
        if (from_status === 'full_individual') {
            upgradeKey = `individual_to_multi_${target_team_size}`
        } else if (from_status === 'team_5') {
            upgradeKey = `multi_5_to_multi_${target_team_size}`
        } else if (from_status === 'team_10') {
            upgradeKey = `multi_10_to_multi_${target_team_size}`
        }

        const expectedPrice = (user.email === 'simonsilvercaldaie@gmail.com' || user.email === 'simonsilvermotocross@gmail.com')
            ? 100
            : UPGRADE_PRICES[upgradeKey]

        if (!expectedPrice) {
            return NextResponse.json({ error: 'invalid_upgrade_path' }, { status: 400 })
        }

        if (upgrade_price_cents !== expectedPrice) {
            return NextResponse.json({ error: 'price_mismatch' }, { status: 400 })
        }

        // 5. Verify PayPal payment
        const { valid, captureId } = await verifyPayPalOrder(orderId, expectedPrice)
        if (!valid) {
            return NextResponse.json({ error: 'payment_verification_failed' }, { status: 402 })
        }

        // 6. Check for duplicate
        const { data: existingPurchase } = await supabaseAdmin
            .from('purchases')
            .select('id')
            .eq('paypal_capture_id', captureId)
            .maybeSingle()

        if (existingPurchase) {
            return NextResponse.json({ error: 'duplicate_order' }, { status: 409 })
        }

        // 7. Perform upgrade based on from_status
        if (from_status === 'full_individual') {
            // Create new team license
            // target_team_size indica i posti invitabili (+1 per l'admin)
            const maxMembers = target_team_size + 1

            const { data: teamLicense, error: teamError } = await supabaseAdmin
                .from('team_licenses')
                .insert({
                    owner_user_id: user.id,
                    seats: maxMembers,
                    company_name: user.email
                })
                .select('id')
                .single()

            if (teamError) {
                console.error('[upgrade-license] Team creation error:', teamError)
                return NextResponse.json({ error: 'team_creation_failed' }, { status: 500 })
            }

            // Add owner as team member
            await supabaseAdmin
                .from('team_members')
                .insert({
                    team_license_id: teamLicense.id,
                    user_id: user.id,
                    role: 'owner'
                })

            // Mark individual purchases as upgraded (optional, for tracking)
            await supabaseAdmin
                .from('purchases')
                .update({ notes: 'Upgraded to Team' })
                .eq('user_id', user.id)

        } else {
            // Upgrade existing team license
            // target_team_size indica i posti invitabili (+1 per l'admin)
            const maxMembers = target_team_size + 1
            const { error: updateError } = await supabaseAdmin
                .from('team_licenses')
                .update({ seats: maxMembers })
                .eq('owner_user_id', user.id)

            if (updateError) {
                console.error('[upgrade-license] Team update error:', updateError)
                return NextResponse.json({ error: 'team_update_failed' }, { status: 500 })
            }
        }

        // 8. Record upgrade purchase
        await supabaseAdmin
            .from('purchases')
            .insert({
                user_id: user.id,
                product_code: `upgrade_to_multi_${target_team_size}`,
                plan_type: 'team_upgrade',
                amount_cents: expectedPrice,
                paypal_capture_id: captureId
            })

        console.log(`[upgrade-license] User ${user.email} upgraded from ${from_status} to team_${target_team_size}`)

        return NextResponse.json({
            ok: true,
            email: user.email,
            target_team_size
        })

    } catch (e: any) {
        console.error('[upgrade-license] Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
