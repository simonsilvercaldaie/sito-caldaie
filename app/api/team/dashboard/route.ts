import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Admin client implies bypassing RLS? 
// No, for the dashboard we want to respect RLS or verify ownership explicitly.
// But using service role is safer for custom logic if we manual check.
// Actually, for Dashboard, standard client with User Token is best to test RLS.
// BUT, Next.js API routes don't pass the user session automatically unless we use createServerClient from ssr.
// Stick to Admin client + Validating User ID from Token.

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 })

        const supabase = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // 1. Get Team Licenses owned by user
        const { data: licenses, error: licError } = await supabase
            .from('team_licenses')
            .select('id, seats, created_at, company_name, free_reassignments_total, free_reassignments_used')
            .eq('owner_user_id', user.id)
            .eq('status', 'active')

        if (licError) throw licError
        if (!licenses || licenses.length === 0) {
            return NextResponse.json({ teams: [] })
        }

        // For this MVP, assumiamo un owner ha 1 team. Ma supportiamo array.
        const teamsStats = []

        for (const lic of licenses) {
            // Count Members
            const { count: memberCount, error: memErr } = await supabase
                .from('team_members')
                .select('*', { count: 'exact', head: true })
                .eq('team_license_id', lic.id)
                .is('removed_at', null)

            if (memErr) throw memErr

            // Fetch Recent Members (for list)
            const { data: members, error: memListErr } = await supabase
                .from('team_members')
                .select('id, user_id, added_at') // Select email via Join if possible? 
                // auth.users is not usually joinable via standard client unless FK exists and permissions allow.
                // Admin client CAN join if we define relationship or just manual fetch.
                // Since 'team_members.user_id' refs 'auth.users', supabase-js might allow it if we are admin.
                // BUT 'auth.users' is in a separate schema. PostgREST usually doesn't expose auth schema directly via select without config.
                // Better approach: Get user_ids, then fetch emails via admin.auth.admin.listUsers() or similar? 
                // Or just return user_id and let frontend handle? Hard for owner to know who is who.
                // Let's try to manual fetch emails for the IDs.
                .eq('team_license_id', lic.id)
                .is('removed_at', null)
                .order('added_at', { ascending: false })

            if (memListErr) console.error("Error fetching members", memListErr)

            // Fetch Pending Invites
            const { data: invites, error: invErr } = await supabase
                .from('team_invitations')
                .select('id, email, status, created_at, expires_at')
                .eq('team_license_id', lic.id)
                .eq('status', 'pending')
                .gt('expires_at', new Date().toISOString())

            if (invErr) throw invErr

            // Enrich Members with Emails
            // Using admin.auth.admin.getUserById behaves one by one. 
            // Batching is better but no listUsers(ids) API easily.
            // We will map over them.
            const enrichedMembers = await Promise.all(members!.map(async (m: any) => {
                const { data: u } = await supabase.auth.admin.getUserById(m.user_id)
                return {
                    ...m,
                    email: u.user?.email || 'Unknown'
                }
            }))

            teamsStats.push({
                licenseId: lic.id,
                seats: lic.seats,
                seatsUsed: memberCount || 0,
                members: enrichedMembers,
                invites: invites || [],
                freeReassignmentsTotal: lic.free_reassignments_total || lic.seats,
                freeReassignmentsUsed: lic.free_reassignments_used || 0
            })
        }

        return NextResponse.json({ teams: teamsStats })

    } catch (e: any) {
        console.error('Dashboard Error', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
