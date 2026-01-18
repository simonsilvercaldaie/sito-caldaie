import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { TOS_VERSION } from '@/lib/constants'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

/**
 * POST /api/verify-tos
 * 
 * Verifica che l'utente abbia accettato i ToS correnti.
 * Autenticazione via Bearer token.
 */
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization') || ''

        if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
            console.error('[verify-tos] Token mancante')
            return NextResponse.json(
                { ok: false, error: 'missing_token' },
                { status: 401 }
            )
        }

        const token = authHeader.replace(/^Bearer\s+/i, '').trim()

        if (!token) {
            return NextResponse.json(
                { ok: false, error: 'empty_token' },
                { status: 401 }
            )
        }

        const { data: { user }, error: authError } = await getSupabaseAdmin().auth.getUser(token)

        if (authError || !user) {
            console.error('[verify-tos] Token invalido:', authError?.message)
            return NextResponse.json(
                { ok: false, error: 'invalid_token' },
                { status: 401 }
            )
        }

        const { data: tosAcceptance, error: tosError } = await getSupabaseAdmin()
            .from('tos_acceptances')
            .select('id, accepted_at')
            .eq('user_id', user.id)
            .eq('tos_version', TOS_VERSION)
            .maybeSingle()

        if (tosError) {
            console.error('[verify-tos] Errore query:', tosError)
            return NextResponse.json(
                { ok: false, error: 'query_error' },
                { status: 500 }
            )
        }

        if (!tosAcceptance) {
            return NextResponse.json(
                { ok: false, error: 'tos_not_accepted', requiredVersion: TOS_VERSION },
                { status: 403 }
            )
        }

        return NextResponse.json({
            ok: true,
            userId: user.id,
            tosVersion: TOS_VERSION,
            acceptedAt: tosAcceptance.accepted_at
        })

    } catch (error) {
        console.error('[verify-tos] Errore interno:', error)
        return NextResponse.json(
            { ok: false, error: 'internal_error' },
            { status: 500 }
        )
    }
}
