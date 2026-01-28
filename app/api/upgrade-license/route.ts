import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'

// Service Role Client
// Service Role Client
// Removed top level init


// PayPal Config
const PAYPAL_API = process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

// Expected upgrade prices in cents
const UPGRADE_PRICES: Record<string, number> = {
    'individual_to_team_5': 80000,
    'individual_to_team_10': 180000,
    'individual_to_team_25': 280000,
    'team_5_to_team_10': 100000,
    'team_5_to_team_25': 200000,
    'team_10_to_team_25': 100000,
}

async function getPayPalAccessToken(): Promise<string> {
    const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')

    const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
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

        const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!res.ok) return { valid: false }

        const order = await res.json()

        if (order.status !== 'COMPLETED') return { valid: false }

        const capture = order.purchase_units?.[0]?.payments?.captures?.[0]
        if (!capture) return { valid: false }

        const paidAmountCents = Math.round(parseFloat(capture.amount.value) * 100)

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
            upgradeKey = `individual_to_team_${target_team_size}`
        } else if (from_status === 'team_5') {
            upgradeKey = `team_5_to_team_${target_team_size}`
        } else if (from_status === 'team_10') {
            upgradeKey = `team_10_to_team_${target_team_size}`
        }

        const expectedPrice = (user.email === 'simonsilvercaldaie@gmail.com')
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
            const validUntil = new Date()
            validUntil.setFullYear(validUntil.getFullYear() + 100) // Lifetime

            const { data: teamLicense, error: teamError } = await supabaseAdmin
                .from('team_licenses')
                .insert({
                    owner_id: user.id,
                    max_members: target_team_size,
                    status: 'active',
                    valid_until: validUntil.toISOString()
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
            const { error: updateError } = await supabaseAdmin
                .from('team_licenses')
                .update({ max_members: target_team_size })
                .eq('owner_id', user.id)
                .eq('status', 'active')

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
                product_code: `upgrade_to_team_${target_team_size}`,
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
