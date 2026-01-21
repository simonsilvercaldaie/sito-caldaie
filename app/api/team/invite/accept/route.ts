import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

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
        const { token: inviteToken } = body

        if (!inviteToken) {
            return NextResponse.json({ error: 'Missing invite token' }, { status: 400 })
        }

        // 1. Hash the incoming token
        const tokenHash = crypto.createHash('sha256').update(inviteToken).digest('hex')

        // 2. Call RPC 'accept_team_invitation'
        const { data: rpcResult, error: rpcErr } = await supabase
            .rpc('accept_team_invitation', {
                p_token_hash: tokenHash,
                p_user_id: user.id
            })

        if (rpcErr) {
            console.error('RPC Error', rpcErr)
            return NextResponse.json({ error: 'Database Error' }, { status: 500 })
        }

        if (!rpcResult.success) {
            // Handle specific errors
            const errCode = rpcResult.error
            let status = 400
            let msg = 'Errore durante accettazione'

            switch (errCode) {
                case 'invitation_not_found': msg = 'Invito non valido o inesistente'; status = 404; break;
                case 'invitation_not_pending': msg = 'Invito già accettato o revocato'; status = 410; break;
                case 'invitation_expired': msg = 'Invito scaduto'; status = 410; break;
                case 'already_member': msg = 'Sei già membro di questo team'; status = 409; break;
                case 'seats_full': msg = 'Il team ha raggiunto il numero massimo di membri'; status = 409; break;
                default: msg = `Errore: ${errCode}`;
            }

            return NextResponse.json({ error: msg, code: errCode }, { status })
        }

        // Success
        return NextResponse.json({ success: true, teamLicenseId: rpcResult.team_license_id })

    } catch (e: any) {
        console.error('Accept Error', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
