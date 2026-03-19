import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { INVOICE_NOTIFICATION_EMAIL } from '@/lib/constants'
import { grantAccessForProduct, revokeAllAccess } from '@/lib/accessControl'

// Initialize Admin Client safely (prevent build error if env missing)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// We don't initialize if keys are missing (e.g. during build without env)
// usage will throw runtime error if keys are missing in prod
const supabaseAdmin = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null as any

// Allowed Admins (Simple Env Var Check)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'simonsilvercaldaie@gmail.com').split(',').map(e => e.trim())

export async function POST(request: NextRequest) {
    try {
        // 1. Auth Check
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const token = authHeader.replace('Bearer ', '')

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server misconfiguration: Missing Admin Keys' }, { status: 500 })
        }

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user || !ADMIN_EMAILS.includes(user.email || '')) {
            console.warn(`[Admin Attempt Blocked] User: ${user?.email}`)
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { action } = body

        // 2. Action Dispatch
        if (action === 'get_stats') {
            return await getStats()
        }
        if (action === 'get_orders') {
            return await getOrders()
        }
        if (action === 'revoke_user') {
            return await revokeUser(body.userId, body.reason)
        }
        if (action === 'send_warning') {
            return await sendWarning(body.email, body.reason)
        }
        if (action === 'grant_access') {
            return await grantAccess(body.email, body.products)
        }
        if (action === 'get_tickets') {
            return await getTickets()
        }
        if (action === 'get_live_users') {
            return await getLiveUsers()
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (e: any) {
        console.error('[Admin API Error]', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

async function grantAccess(email: string, products: string[]) {
    if (!products || products.length === 0) return NextResponse.json({ error: 'No products selected' }, { status: 400 })

    // 1. Find User
    const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 10000 })
    const targetUser = allUsers.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())

    if (!targetUser) {
        return NextResponse.json({ error: 'Utente non trovato. Deve essere registrato.' }, { status: 404 })
    }

    const userId = targetUser.id

    // 2. Map frontend level names to product_code and grant access
    const LEVEL_TO_PRODUCT: Record<string, string> = {
        'base': 'base',
        'intermedio': 'intermediate',
        'avanzato': 'advanced',
    }

    for (const level of products) {
        const productCode = LEVEL_TO_PRODUCT[level]
        if (!productCode) continue

        // Insert purchase record for audit trail
        const captureId = `MANUAL_GRANT_${new Date().toISOString().split('T')[0]}_${Math.floor(Math.random() * 1000)}`

        const { data: existing } = await supabaseAdmin.from('purchases').select('id')
            .eq('user_id', userId)
            .eq('product_code', productCode)
            .maybeSingle()

        let purchaseId: string | undefined
        if (!existing) {
            const { data: newPurchase } = await supabaseAdmin.from('purchases').insert({
                user_id: userId,
                product_code: productCode,
                amount_cents: 0,
                plan_type: 'individual',
                paypal_capture_id: captureId,
                snapshot_company_name: 'REGALO ADMIN'
            }).select('id').single()
            purchaseId = newPurchase?.id
        } else {
            purchaseId = existing.id
        }

        // Grant access via centralized helper
        await grantAccessForProduct(userId, productCode, 'admin', purchaseId)
    }

    return NextResponse.json({ success: true, message: `Accesso garantito a ${email}` })
}

async function getStats() {
    // Basic stats
    const { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
    const { count: totalOrders } = await supabaseAdmin.from('purchases').select('*', { count: 'exact', head: true })

    // Recent security events
    const { data: securityEvents } = await supabaseAdmin
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

    return NextResponse.json({ totalUsers, totalOrders, securityEvents })
}

async function getOrders() {
    const { data: orders } = await supabaseAdmin
        .from('purchases')
        .select(`
            *,
            user:user_id (email)
        `)
        .order('created_at', { ascending: false })
        .limit(50)
    return NextResponse.json({ orders })
}

async function revokeUser(userId: string, reason: string) {
    // 1. Log revocation
    await supabaseAdmin.from('security_events').insert({
        user_id: userId,
        event_type: 'session_blocked',
        metadata: { reason, admin_action: 'revocation' }
    })

    // 2. Delete all sessions
    await supabaseAdmin.from('active_sessions').delete().eq('user_id', userId)

    // 3. Delete trusted devices
    await supabaseAdmin.from('trusted_devices').delete().eq('user_id', userId)

    // 4. Revoke all video access
    await revokeAllAccess(userId)

    // 5. Delete purchase records
    await supabaseAdmin.from('purchases').delete().eq('user_id', userId)

    return NextResponse.json({ success: true, message: 'License revoked (purchases + access deleted) and sessions cleared.' })
}

async function sendWarning(email: string, reason: string) {
    // Use EmailJS to send specific warning
    // For simplicity here, we assume client-side or duplicate server-side logic.
    // But implementation plan used fetch to EmailJS.

    const { LEGAL_EMAIL_PRE_BLOCK } = await import('@/lib/legalTexts')

    const emailData = {
        service_id: 'service_fwvybtr', // TODO: Move to Env if possible, hardcoded from previous file
        template_id: 'template_b8p58ci', // Generic template? Or we need custom?
        user_id: 'NcJg5-hiu3gVJiJZ-',
        template_params: {
            from_name: 'Simon Silver Admin',
            from_email: 'admin@simonsilvercaldaie.it',
            to_email: email,
            subject: 'AVVISO DI SICUREZZA',
            message: LEGAL_EMAIL_PRE_BLOCK + `\n\nMotivo specifico: ${reason}`
        }
    }

    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
    })

    return NextResponse.json({ success: true })
}

async function getTickets() {
    // 1. Fetch tickets without join first (safer)
    const { data: tickets, error } = await supabaseAdmin
        .from('tickets')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error fetching tickets:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!tickets || tickets.length === 0) {
        return NextResponse.json({ tickets: [] })
    }

    // 2. Fetch users manually to map emails
    // We get all users for simplicity (or we could filter by specific IDs if listUsers supports it efficiently, but it doesn't really)
    // For < 10k users, fetching all ids/emails is fast enough.
    // Optimization: Collect unique user IDs from tickets? listUsers doesn't support "in" filter easily.
    // We fall back to fetching latest 1000 users or so.
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

    // Create map
    const userMap = new Map()
    users.forEach((u: any) => userMap.set(u.id, u.email))

    // 3. Attach email to tickets
    const enrichedTickets = tickets.map((t: any) => ({
        ...t,
        user: {
            email: userMap.get(t.user_id) || 'Utente sconosciuto'
        }
    }))

    return NextResponse.json({ tickets: enrichedTickets })
}

async function getLiveUsers() {
    // Count active sessions in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

    // Check user_presence table
    const { count, error } = await supabaseAdmin
        .from('user_presence')
        .select('*', { count: 'exact', head: true })
        .gt('last_seen_at', fifteenMinutesAgo)

    if (error) {
        console.error('Error fetching live users:', error)
        // Fallback or return 0
        return NextResponse.json({ count: 0 })
    }

    // console.log(`[Admin] Live Users Count: ${count}`) // Optional debug
    return NextResponse.json({ count: count || 0 })
}
