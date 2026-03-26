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

        // 2. Use the RPC (same as token-based accept) with the stored token_hash
        const { data: rpcResult, error: rpcErr } = await supabase
            .rpc('accept_team_invitation', {
                p_token_hash: invite.token_hash,
                p_user_id: user.id
            })

        if (rpcErr) {
            console.error('RPC Error', rpcErr)
            return NextResponse.json({ error: 'Errore database' }, { status: 500 })
        }

        if (!rpcResult.success) {
            const errCode = rpcResult.error
            let msg = 'Errore durante accettazione'
            let status = 400

            switch (errCode) {
                case 'invitation_not_found': msg = 'Invito non valido'; status = 404; break
                case 'invitation_not_pending': msg = 'Invito già accettato o revocato'; status = 410; break
                case 'invitation_expired': msg = 'Invito scaduto'; status = 410; break
                case 'already_member': msg = 'Sei già membro di questo team'; status = 409; break
                case 'seats_full': msg = 'Il team ha raggiunto il numero massimo di membri'; status = 409; break
                default: msg = `Errore: ${errCode}`
            }

            return NextResponse.json({ error: msg, code: errCode }, { status })
        }

        return NextResponse.json({ success: true, teamLicenseId: rpcResult.team_license_id })

    } catch (e: any) {
        console.error('Accept-by-ID Error', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
