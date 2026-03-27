import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { INVOICE_NOTIFICATION_EMAIL } from '@/lib/constants'
import { grantAccessForProduct, revokeAllAccess } from '@/lib/accessControl'

// Initialize Admin Client safely (prevent build error if env missing)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAdmin = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null as any

// Allowed Admins
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'simonsilvercaldaie@gmail.com').split(',').map(e => e.trim())

// -------------------------------------------------------------------
// AUDIT LOG HELPER
// -------------------------------------------------------------------
async function logAdminAction(
    adminEmail: string,
    targetUserId: string | null,
    targetEmail: string | null,
    action: string,
    details: Record<string, any> = {}
) {
    try {
        await supabaseAdmin.from('admin_audit_log').insert({
            admin_email: adminEmail,
            target_user_id: targetUserId,
            target_email: targetEmail,
            action,
            details
        })
    } catch (e) {
        console.error('[Admin Audit] Failed to log:', e)
    }
}

// -------------------------------------------------------------------
// FIND USER HELPER
// -------------------------------------------------------------------
async function findUserByEmail(email: string) {
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 10000 })
    return users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
}

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

        const adminEmail = user.email!
        const body = await request.json()
        const { action } = body

        // 2. Action Dispatch
        if (action === 'get_stats') return await getStats()
        if (action === 'get_orders') return await getOrders()
        if (action === 'get_tickets') return await getTickets()
        if (action === 'get_live_users') return await getLiveUsers()
        if (action === 'get_teams') return await getTeams()

        // Actions with audit logging
        if (action === 'revoke_user') return await revokeUser(body.userId, body.reason, adminEmail)
        if (action === 'send_warning') return await sendWarning(body.email, body.reason, adminEmail)
        if (action === 'grant_access') return await grantAccess(body.email, body.products, adminEmail)
        if (action === 'reset_devices') return await resetUserDevices(body.userId, adminEmail)
        if (action === 'reset_devices_by_email') return await resetDevicesByEmail(body.email, adminEmail)
        if (action === 'update_team_seats') return await updateTeamSeats(body.teamId, body.seats, adminEmail)

        // New actions
        if (action === 'get_user_card') return await getUserCard(body.email)
        if (action === 'admin_revoke_access') return await adminRevokeAccess(body.userId, body.levels, body.reason, adminEmail)
        if (action === 'admin_add_note') return await adminAddNote(body.userId, body.note, adminEmail)
        if (action === 'get_audit_log') return await getAuditLog(body.userId)

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (e: any) {
        console.error('[Admin API Error]', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

// -------------------------------------------------------------------
// GET USER CARD — Complete user profile for admin
// -------------------------------------------------------------------
async function getUserCard(email: string) {
    if (!email) return NextResponse.json({ error: 'Email richiesta' }, { status: 400 })

    const targetUser = await findUserByEmail(email)
    if (!targetUser) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })

    const userId = targetUser.id

    // Parallel fetch all data
    const [
        profileRes,
        purchasesRes,
        accessRes,
        devicesRes,
        sessionsRes,
        teamOwnerRes,
        teamMemberRes,
        eventsRes,
        notesRes,
        billingRes,
        presenceRes
    ] = await Promise.all([
        supabaseAdmin.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabaseAdmin.from('purchases').select('*').order('created_at', { ascending: false }).eq('user_id', userId),
        supabaseAdmin.from('user_access').select('*').eq('user_id', userId),
        supabaseAdmin.from('trusted_devices').select('*').eq('user_id', userId),
        supabaseAdmin.from('active_sessions').select('*').eq('user_id', userId),
        supabaseAdmin.from('team_licenses').select('*').eq('owner_user_id', userId),
        supabaseAdmin.from('team_members').select('*, team_license:team_license_id(id, company_name, owner_user_id, seats)').eq('user_id', userId).is('removed_at', null),
        supabaseAdmin.from('security_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
        supabaseAdmin.from('admin_notes').select('*').eq('target_user_id', userId).order('created_at', { ascending: false }),
        supabaseAdmin.from('billing_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabaseAdmin.from('user_presence').select('*').eq('user_id', userId).maybeSingle()
    ])

    // Detect anomalies
    const anomalies: string[] = []

    // 1. Purchase without access grant
    const purchases = purchasesRes.data || []
    const access = accessRes.data || []
    const individualPurchases = purchases.filter((p: any) => p.plan_type === 'individual')
    for (const p of individualPurchases) {
        const hasGrant = access.some((a: any) => a.purchase_id === p.id)
        if (!hasGrant) {
            anomalies.push(`⚠ Purchase ${p.product_code} (${p.id.slice(0, 8)}) senza access grant`)
        }
    }

    // 2. Access without purchase (potential abuse)
    for (const a of access) {
        if (a.source === 'purchase' && a.purchase_id) {
            const hasPurchase = purchases.some((p: any) => p.id === a.purchase_id)
            if (!hasPurchase) {
                anomalies.push(`⚠ Access ${a.access_level} con purchase_id orfano`)
            }
        }
    }

    // 3. Too many devices
    const devices = devicesRes.data || []
    if (devices.length > 2) {
        anomalies.push(`⚠ ${devices.length} dispositivi attivi (limite: 2)`)
    }

    // 4. Stale sessions
    const sessions = sessionsRes.data || []
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const staleSessions = sessions.filter((s: any) => s.last_seen_at < oneHourAgo)
    if (staleSessions.length > 0) {
        anomalies.push(`⚠ ${staleSessions.length} sessioni scadute non pulite`)
    }

    return NextResponse.json({
        user: {
            id: targetUser.id,
            email: targetUser.email,
            created_at: targetUser.created_at,
            last_sign_in_at: targetUser.last_sign_in_at,
            provider: targetUser.app_metadata?.provider || 'unknown'
        },
        profile: profileRes.data,
        billing: billingRes.data,
        purchases,
        access,
        devices,
        sessions,
        presence: presenceRes.data,
        teamOwnership: teamOwnerRes.data || [],
        teamMembership: teamMemberRes.data || [],
        securityEvents: eventsRes.data || [],
        notes: notesRes.data || [],
        anomalies
    })
}

// -------------------------------------------------------------------
// ADMIN REVOKE ACCESS — revoke specific levels
// -------------------------------------------------------------------
async function adminRevokeAccess(userId: string, levels: string[], reason: string, adminEmail: string) {
    if (!userId || !levels || levels.length === 0) {
        return NextResponse.json({ error: 'userId e levels richiesti' }, { status: 400 })
    }

    // Get before state
    const { data: before } = await supabaseAdmin.from('user_access')
        .select('access_level').eq('user_id', userId)

    // Delete specific levels
    const { error } = await supabaseAdmin.from('user_access')
        .delete()
        .eq('user_id', userId)
        .in('access_level', levels)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Get after state
    const { data: after } = await supabaseAdmin.from('user_access')
        .select('access_level').eq('user_id', userId)

    // Find target email
    const target = await findUserByEmail(userId) // try by ID too
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 10000 })
    const targetUser = users.find((u: any) => u.id === userId)

    await logAdminAction(adminEmail, userId, targetUser?.email || null, 'revoke_access', {
        reason,
        levels_revoked: levels,
        before: before?.map((a: any) => a.access_level) || [],
        after: after?.map((a: any) => a.access_level) || []
    })

    return NextResponse.json({ success: true, message: `Accesso revocato: ${levels.join(', ')}` })
}

// -------------------------------------------------------------------
// ADMIN ADD NOTE
// -------------------------------------------------------------------
async function adminAddNote(userId: string, note: string, adminEmail: string) {
    if (!userId || !note) return NextResponse.json({ error: 'userId e note richiesti' }, { status: 400 })

    const { error } = await supabaseAdmin.from('admin_notes').insert({
        target_user_id: userId,
        admin_email: adminEmail,
        note
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAdminAction(adminEmail, userId, null, 'add_note', { note: note.slice(0, 200) })

    return NextResponse.json({ success: true })
}

// -------------------------------------------------------------------
// GET AUDIT LOG
// -------------------------------------------------------------------
async function getAuditLog(userId?: string) {
    let query = supabaseAdmin.from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    if (userId) {
        query = query.eq('target_user_id', userId)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ logs: data || [] })
}

// -------------------------------------------------------------------
// EXISTING FUNCTIONS — now with audit logging
// -------------------------------------------------------------------

async function grantAccess(email: string, products: string[], adminEmail: string) {
    if (!products || products.length === 0) return NextResponse.json({ error: 'No products selected' }, { status: 400 })

    const targetUser = await findUserByEmail(email)
    if (!targetUser) return NextResponse.json({ error: 'Utente non trovato. Deve essere registrato.' }, { status: 404 })

    const userId = targetUser.id
    const LEVEL_TO_PRODUCT: Record<string, string> = {
        'base': 'base',
        'intermedio': 'intermediate',
        'avanzato': 'advanced',
    }

    for (const level of products) {
        const productCode = LEVEL_TO_PRODUCT[level]
        if (!productCode) continue

        const captureId = `MANUAL_GRANT_${new Date().toISOString().split('T')[0]}_${Math.floor(Math.random() * 1000)}`

        const { data: existing } = await supabaseAdmin.from('purchases').select('id')
            .eq('user_id', userId)
            .eq('product_code', productCode)
            .maybeSingle()

        let purchaseId: string | undefined
        if (!existing) {
            const { data: newPurchase, error: insertError } = await supabaseAdmin.from('purchases').insert({
                user_id: userId,
                product_code: productCode,
                amount_cents: 0,
                plan_type: 'individual',
                paypal_order_id: captureId,
                paypal_capture_id: captureId,
                snapshot_company_name: 'REGALO ADMIN'
            }).select('id').single()
            if (insertError) console.error('[Admin grantAccess] Insert error:', insertError)
            purchaseId = newPurchase?.id
        } else {
            purchaseId = existing.id
        }

        await grantAccessForProduct(userId, productCode, 'admin', purchaseId)
    }

    await logAdminAction(adminEmail, userId, email, 'grant_access', {
        levels_granted: products
    })

    return NextResponse.json({ success: true, message: `Accesso garantito a ${email}` })
}

async function getStats() {
    const { count: totalUsers } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
    const { count: totalOrders } = await supabaseAdmin.from('purchases').select('*', { count: 'exact', head: true })

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

async function revokeUser(userId: string, reason: string, adminEmail: string) {
    // Get before state
    const { data: beforeAccess } = await supabaseAdmin.from('user_access').select('access_level').eq('user_id', userId)
    const { data: beforePurchases } = await supabaseAdmin.from('purchases').select('product_code').eq('user_id', userId)

    // Find target email
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 10000 })
    const targetUser = users.find((u: any) => u.id === userId)

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

    await logAdminAction(adminEmail, userId, targetUser?.email || null, 'revoke_user', {
        reason,
        before_access: beforeAccess?.map((a: any) => a.access_level) || [],
        before_purchases: beforePurchases?.map((p: any) => p.product_code) || []
    })

    return NextResponse.json({ success: true, message: 'License revoked (purchases + access deleted) and sessions cleared.' })
}

async function sendWarning(email: string, reason: string, adminEmail: string) {
    const { LEGAL_EMAIL_PRE_BLOCK } = await import('@/lib/legalTexts')

    const emailData = {
        service_id: 'service_fwvybtr',
        template_id: 'template_b8p58ci',
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

    await logAdminAction(adminEmail, null, email, 'send_warning', { reason })

    return NextResponse.json({ success: true })
}

async function getTickets() {
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

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    const userMap = new Map()
    users.forEach((u: any) => userMap.set(u.id, u.email))

    const enrichedTickets = tickets.map((t: any) => ({
        ...t,
        user: {
            email: userMap.get(t.user_id) || 'Utente sconosciuto'
        }
    }))

    return NextResponse.json({ tickets: enrichedTickets })
}

async function getLiveUsers() {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()

    const { count, error } = await supabaseAdmin
        .from('user_presence')
        .select('*', { count: 'exact', head: true })
        .gt('last_seen_at', fifteenMinutesAgo)

    if (error) {
        console.error('Error fetching live users:', error)
        return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count || 0 })
}

async function resetDevicesByEmail(email: string, adminEmail: string) {
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const targetUser = await findUserByEmail(email)
    if (!targetUser) return NextResponse.json({ error: 'Utente non trovato.' }, { status: 404 })

    return await resetUserDevices(targetUser.id, adminEmail, email)
}

async function resetUserDevices(userId: string, adminEmail: string, targetEmail?: string) {
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    // Get before state
    const { data: beforeDevices } = await supabaseAdmin.from('trusted_devices').select('id, device_name').eq('user_id', userId)
    const { data: beforeSessions } = await supabaseAdmin.from('active_sessions').select('id').eq('user_id', userId)

    // Clear trusted_devices and active_sessions
    await supabaseAdmin.from('trusted_devices').delete().eq('user_id', userId)
    await supabaseAdmin.from('active_sessions').delete().eq('user_id', userId)

    // Update last reset date
    await supabaseAdmin.from('profiles').update({
        last_device_reset_at: new Date().toISOString()
    }).eq('id', userId)

    // Resolve email if not provided
    if (!targetEmail) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 10000 })
        const u = users.find((u: any) => u.id === userId)
        targetEmail = u?.email
    }

    await logAdminAction(adminEmail, userId, targetEmail || null, 'reset_devices', {
        devices_removed: beforeDevices?.length || 0,
        sessions_removed: beforeSessions?.length || 0
    })

    return NextResponse.json({ success: true, message: 'Dispositivi e sessioni resettati con successo.' })
}

async function getTeams() {
    const { data: teams, error } = await supabaseAdmin
        .from('team_licenses')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!teams || teams.length === 0) return NextResponse.json({ teams: [] })

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    const userMap = new Map()
    users.forEach((u: any) => userMap.set(u.id, u.email))

    const teamIds = teams.map((t: any) => t.id)
    const { data: members, error: memErr } = await supabaseAdmin
        .from('team_members')
        .select('team_license_id')
        .is('removed_at', null)
        .in('team_license_id', teamIds)

    const memCounts = new Map()
    if (!memErr && members) {
        members.forEach((m: any) => {
            memCounts.set(m.team_license_id, (memCounts.get(m.team_license_id) || 0) + 1)
        })
    }

    const enrichedTeams = teams.map((t: any) => ({
        ...t,
        owner_email: userMap.get(t.owner_user_id) || 'Sconosciuto',
        active_members_count: memCounts.get(t.id) || 0
    }))

    return NextResponse.json({ teams: enrichedTeams })
}

async function updateTeamSeats(teamId: string, seats: number, adminEmail: string) {
    if (!teamId || typeof seats !== 'number' || seats < 1) {
        return NextResponse.json({ error: 'Dati validi necessari' }, { status: 400 })
    }

    // Get before state
    const { data: before } = await supabaseAdmin.from('team_licenses').select('seats, owner_user_id').eq('id', teamId).maybeSingle()

    const { error } = await supabaseAdmin
        .from('team_licenses')
        .update({ seats })
        .eq('id', teamId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Resolve owner email
    let ownerEmail: string | null = null
    if (before?.owner_user_id) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 10000 })
        const owner = users.find((u: any) => u.id === before.owner_user_id)
        ownerEmail = owner?.email || null
    }

    await logAdminAction(adminEmail, before?.owner_user_id || null, ownerEmail, 'update_team_seats', {
        team_id: teamId,
        before_seats: before?.seats,
        after_seats: seats
    })

    return NextResponse.json({ success: true, message: 'Posti aggiornati con successo.' })
}
