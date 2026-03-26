import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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

        // Find pending invites for this user's email
        const { data: invites, error: invErr } = await supabase
            .from('team_invitations')
            .select('id, team_license_id, email, created_at, expires_at')
            .eq('email', user.email?.toLowerCase())
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())

        if (invErr) throw invErr

        if (!invites || invites.length === 0) {
            return NextResponse.json({ invites: [] })
        }

        // Enrich with owner info
        const enrichedInvites = await Promise.all(invites.map(async (inv) => {
            const { data: license } = await supabase
                .from('team_licenses')
                .select('owner_user_id, company_name, seats')
                .eq('id', inv.team_license_id)
                .single()

            let ownerEmail = 'Sconosciuto'
            if (license) {
                const { data: ownerUser } = await supabase.auth.admin.getUserById(license.owner_user_id)
                ownerEmail = ownerUser.user?.email || 'Sconosciuto'
            }

            return {
                id: inv.id,
                teamLicenseId: inv.team_license_id,
                companyName: license?.company_name || ownerEmail,
                ownerEmail,
                seats: license?.seats || 0,
                createdAt: inv.created_at,
                expiresAt: inv.expires_at
            }
        }))

        return NextResponse.json({ invites: enrichedInvites })

    } catch (e: any) {
        console.error('Pending Invites Error', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
