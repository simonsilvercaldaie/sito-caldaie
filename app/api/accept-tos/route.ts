import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { TOS_VERSION } from '@/lib/constants'

/**
 * POST /api/accept-tos
 * 
 * Salva l'accettazione dei ToS con dati antifrode (IP, User-Agent).
 * Usa createClient da @supabase/ssr per leggere la sessione dai cookie.
 */
export async function POST(request: NextRequest) {
    try {
        // Crea client Supabase con sessione da cookie
        const supabase = await createClient()

        // Verifica sessione utente
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error('[accept-tos] Utente non autenticato:', authError?.message)
            return NextResponse.json(
                { error: 'Non autenticato', code: 'UNAUTHORIZED' },
                { status: 401 }
            )
        }

        // Raccogli dati antifrode dagli headers
        const headersList = await headers()
        const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
            || headersList.get('x-real-ip')
            || 'unknown'
        const userAgent = headersList.get('user-agent') || 'unknown'

        // Upsert accettazione ToS con dati antifrode
        const { error: tosError } = await supabase
            .from('tos_acceptances')
            .upsert(
                {
                    user_id: user.id,
                    tos_version: TOS_VERSION,
                    ip_address: ipAddress,
                    user_agent: userAgent.substring(0, 500)
                },
                { onConflict: 'user_id,tos_version', ignoreDuplicates: true }
            )

        if (tosError) {
            // Se è unique constraint violation, l'utente ha già accettato
            if (tosError.code === '23505') {
                return NextResponse.json({
                    success: true,
                    alreadyAccepted: true,
                    message: 'ToS già accettati'
                }, { status: 409 })
            }

            console.error('[accept-tos] Errore salvataggio:', tosError)
            return NextResponse.json(
                { error: 'Errore salvataggio accettazione', code: 'SAVE_ERROR' },
                { status: 500 }
            )
        }

        // Conferma salvataggio
        const { data: tosCheck } = await supabase
            .from('tos_acceptances')
            .select('id, accepted_at')
            .eq('user_id', user.id)
            .eq('tos_version', TOS_VERSION)
            .maybeSingle()

        if (!tosCheck) {
            return NextResponse.json(
                { error: 'Errore conferma salvataggio', code: 'CONFIRM_ERROR' },
                { status: 500 }
            )
        }

        console.log(`[accept-tos] ToS accettati da user ${user.id} versione ${TOS_VERSION}`)

        return NextResponse.json({
            success: true,
            tosVersion: TOS_VERSION,
            acceptedAt: tosCheck.accepted_at
        })

    } catch (error) {
        console.error('[accept-tos] Errore interno:', error)
        return NextResponse.json(
            { error: 'Errore interno del server', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}
