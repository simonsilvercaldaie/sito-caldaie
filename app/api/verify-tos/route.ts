import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TOS_VERSION } from '@/lib/constants'

/**
 * POST /api/verify-tos
 * 
 * Verifica che l'utente autenticato abbia accettato i ToS correnti.
 * Usa createClient da @supabase/ssr per leggere la sessione dai cookie.
 */
export async function POST(request: NextRequest) {
    try {
        // Crea client Supabase con sessione da cookie
        const supabase = await createClient()

        // Verifica sessione utente
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error('[verify-tos] Utente non autenticato:', authError?.message)
            return NextResponse.json(
                { error: 'Non autenticato', code: 'UNAUTHORIZED' },
                { status: 401 }
            )
        }

        // Verifica accettazione ToS per questa versione
        const { data: tosAcceptance, error: tosError } = await supabase
            .from('tos_acceptances')
            .select('id, accepted_at')
            .eq('user_id', user.id)
            .eq('tos_version', TOS_VERSION)
            .maybeSingle()

        if (tosError) {
            console.error('[verify-tos] Errore verifica:', tosError)
            return NextResponse.json(
                { error: 'Errore verifica accettazione Termini', code: 'TOS_CHECK_ERROR' },
                { status: 500 }
            )
        }

        if (!tosAcceptance) {
            return NextResponse.json(
                {
                    error: 'Accetta i Termini e Condizioni prima di acquistare',
                    code: 'TOS_NOT_ACCEPTED',
                    requiredVersion: TOS_VERSION
                },
                { status: 403 }
            )
        }

        return NextResponse.json({
            success: true,
            userId: user.id,
            tosAccepted: true,
            tosVersion: TOS_VERSION,
            acceptedAt: tosAcceptance.accepted_at
        })

    } catch (error) {
        console.error('[verify-tos] Errore interno:', error)
        return NextResponse.json(
            { error: 'Errore interno del server', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}
