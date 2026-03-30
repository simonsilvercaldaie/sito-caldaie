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
            .select('id, seats, created_at, company_name, max_invites_total, invites_used')
            .eq('owner_user_id', user.id)

        if (licError) throw licError
        if (!licenses || licenses.length === 0) {
            return NextResponse.json({ teams: [] })
        }

        // For this MVP, assumiamo un owner ha 1 team. Ma supportiamo array.
        const teamsStats = []

        for (const lic of licenses) {
            // Count Members (exclude admin/owner)
            const { count: memberCount, error: memErr } = await supabase
                .from('team_members')
                .select('*', { count: 'exact', head: true })
                .eq('team_license_id', lic.id)
                .is('removed_at', null)
                .neq('user_id', user.id)

            if (memErr) throw memErr

            // Fetch Recent Members for list (exclude admin/owner)
            const { data: members, error: memListErr } = await supabase
                .from('team_members')
                .select('id, user_id, added_at, display_name')
                .eq('team_license_id', lic.id)
                .is('removed_at', null)
                .neq('user_id', user.id)
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

            // Enrich Members with Emails + Video Progress
            const memberIds = (members || []).map((m: any) => m.user_id)
            const { data: allProgress } = await supabase
                .from('video_watch_progress')
                .select('user_id, course_id, watch_seconds, completed')
                .in('user_id', memberIds.length > 0 ? memberIds : ['__none__'])

            const progressMap = new Map<string, any[]>()
            for (const p of (allProgress || [])) {
                if (!progressMap.has(p.user_id)) progressMap.set(p.user_id, [])
                progressMap.get(p.user_id)!.push(p)
            }

            const enrichedMembers = await Promise.all((members || []).map(async (m: any) => {
                const { data: u } = await supabase.auth.admin.getUserById(m.user_id)
                const userProgress = progressMap.get(m.user_id) || []
                const completedCount = userProgress.filter((p: any) => p.completed).length
                const totalSeconds = userProgress.reduce((sum: number, p: any) => sum + (p.watch_seconds || 0), 0)
                return {
                    ...m,
                    email: u.user?.email || 'Unknown',
                    completedCount,
                    totalCourses: 27,
                    totalMinutes: Math.round(totalSeconds / 60),
                    completedAll: completedCount >= 27
                }
            }))

            const employeeSlots = lic.seats - 1 // seats include admin
            const maxInvites = lic.max_invites_total || (employeeSlots * 2)
            const invitesUsed = lic.invites_used || 0

            teamsStats.push({
                licenseId: lic.id,
                companyName: lic.company_name || '',
                seats: employeeSlots,
                seatsUsed: memberCount || 0,
                members: enrichedMembers,
                invites: invites || [],
                maxInvites,
                invitesUsed,
                invitesRemaining: Math.max(0, maxInvites - invitesUsed)
            })
        }

        return NextResponse.json({ teams: teamsStats })

    } catch (e: any) {
        console.error('Dashboard Error', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

// POST: Update member display_name
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 })

        const supabase = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { action, memberId, displayName, teamLicenseId } = await request.json()

        if (action === 'update_member_name') {
            // Verify ownership
            const { data: license } = await supabase
                .from('team_licenses')
                .select('id')
                .eq('id', teamLicenseId)
                .eq('owner_user_id', user.id)
                .maybeSingle()

            if (!license) return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })

            const { error } = await supabase
                .from('team_members')
                .update({ display_name: displayName })
                .eq('id', memberId)
                .eq('team_license_id', teamLicenseId)

            if (error) return NextResponse.json({ error: error.message }, { status: 500 })
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
