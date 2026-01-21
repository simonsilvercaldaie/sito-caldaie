import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

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

        if (!inviteId) return NextResponse.json({ error: 'Missing inviteId' }, { status: 400 })

        // 1. Verify Ownership of the invite's license
        // We can do this with a single update if RLS was on, BUT we are admin client.
        // So we must manual check or rely on a "Safe" query.

        // Find invite and join license
        const { data: invite, error: invErr } = await supabase
            .from('team_invitations')
            .select('id, team_licenses(owner_user_id), status')
            .eq('id', inviteId)
            .single()

        if (invErr || !invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })

        const ownerId = (invite.team_licenses as any)?.owner_user_id
        if (ownerId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 2. Revoke
        const { error: updateErr } = await supabase
            .from('team_invitations')
            .update({ status: 'revoked' })
            .eq('id', inviteId)

        if (updateErr) throw updateErr

        return NextResponse.json({ success: true })

    } catch (e: any) {
        console.error('Revoke Error', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
