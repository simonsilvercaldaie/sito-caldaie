import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// Accept invite by invite ID (for in-dashboard acceptance)
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 })

        const supabase = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)

        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { inviteId } = body

        if (!inviteId) {
            return NextResponse.json({ error: 'Missing inviteId' }, { status: 400 })
        }

        // 1. Fetch invite and verify it belongs to this user's email
        const { data: invite, error: invErr } = await supabase
            .from('team_invitations')
            .select('id, team_license_id, email, status, expires_at, token_hash')
            .eq('id', inviteId)
            .single()

        if (invErr || !invite) {
            return NextResponse.json({ error: 'Invito non trovato' }, { status: 404 })
        }

        if (invite.email !== user.email?.toLowerCase()) {
            return NextResponse.json({ error: 'Questo invito non è per il tuo account' }, { status: 403 })
        }

        if (invite.status !== 'pending') {
            return NextResponse.json({ error: 'Invito già accettato o revocato' }, { status: 410 })
        }

        if (new Date(invite.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Invito scaduto' }, { status: 410 })
        }

        // 2. Check license seat availability and invite limits
        const { data: license, error: licErr } = await supabase
            .from('team_licenses')
            .select('id, seats, max_invites_total, invites_used, owner_user_id')
            .eq('id', invite.team_license_id)
            .single()

        if (licErr || !license) {
            return NextResponse.json({ error: 'Licenza non trovata' }, { status: 404 })
        }

        const employeeSlots = license.seats - 1 // seats include admin
        const maxInvites = license.max_invites_total || (employeeSlots * 2)
        const invitesUsed = license.invites_used || 0

        // Check if invite limit reached
        if (invitesUsed >= maxInvites) {
            return NextResponse.json({ error: 'Limite inviti raggiunto. Contatta l\'amministratore.' }, { status: 409 })
        }

        // Count current active members (excluding the admin)
        const { count: activeMembers } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_license_id', license.id)
            .is('removed_at', null)
            .neq('user_id', license.owner_user_id)

        if ((activeMembers || 0) >= employeeSlots) {
            return NextResponse.json({ error: 'Il gruppo è pieno. Non ci sono posti disponibili al momento.', code: 'seats_full' }, { status: 409 })
        }

        // Check if user is already a member
        const { data: existing } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_license_id', license.id)
            .eq('user_id', user.id)
            .is('removed_at', null)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ error: 'Sei già membro di questo team', code: 'already_member' }, { status: 409 })
        }

        // 3. Insert team member
        const { error: insertErr } = await supabase
            .from('team_members')
            .insert({
                team_license_id: license.id,
                user_id: user.id,
                added_at: new Date().toISOString()
            })

        if (insertErr) {
            console.error('Insert member error', insertErr)
            return NextResponse.json({ error: 'Errore inserimento membro' }, { status: 500 })
        }

        // 4. Update invite status to accepted
        await supabase
            .from('team_invitations')
            .update({ status: 'accepted' })
            .eq('id', invite.id)

        // 5. Increment invites_used on the license
        await supabase
            .from('team_licenses')
            .update({ invites_used: invitesUsed + 1 })
            .eq('id', license.id)

        return NextResponse.json({ success: true, teamLicenseId: license.id })

    } catch (e: any) {
        console.error('Accept-by-ID Error', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
