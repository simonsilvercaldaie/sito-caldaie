import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { TOS_VERSION } from '@/lib/constants'

// Client Supabase admin (lazy init per evitare errore a build time)
function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

/**
 * POST /api/accept-tos
 * 
 * Registra l'accettazione ToS dell'utente.
 * Autenticazione via Bearer token (non cookie).
 * 
 * Headers richiesti:
 * - Authorization: Bearer <access_token>
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Leggi header Authorization
        const authHeader = request.headers.get('authorization') || ''

        if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
            console.error('[accept-tos] Token mancante')
            return NextResponse.json(
                { ok: false, error: 'missing_token' },
                { status: 401 }
            )
        }

        // 2. Estrai token
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()

        if (!token) {
            console.error('[accept-tos] Token vuoto')
            return NextResponse.json(
                { ok: false, error: 'empty_token' },
                { status: 401 }
            )
        }

        // 3. Verifica utente con token usando service role client
        const { data: { user }, error: authError } = await getSupabaseAdmin().auth.getUser(token)

        if (authError || !user) {
            console.error('[accept-tos] Token invalido o user nullo:', authError?.message)
            return NextResponse.json(
                { ok: false, error: 'invalid_token' },
                { status: 401 }
            )
        }

        console.log(`[accept-tos] Utente verificato: ${user.id}`)

        // 4. Raccogli dati antifrode dagli headers
        const headersList = await headers()
        const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
            || headersList.get('x-real-ip')
            || 'unknown'
        const userAgent = headersList.get('user-agent') || 'unknown'

        // 5. Verifica se già accettato (idempotenza)
        const { data: existing } = await getSupabaseAdmin()
            .from('tos_acceptances')
            .select('id')
            .eq('user_id', user.id)
            .eq('tos_version', TOS_VERSION)
            .maybeSingle()

        if (existing) {
            console.log(`[accept-tos] Già accettato per user ${user.id}`)
            return NextResponse.json(
                { ok: true, alreadyAccepted: true },
                { status: 409 }
            )
        }

        // 6. Inserisci nuova accettazione
        const { error: insertError } = await getSupabaseAdmin()
            .from('tos_acceptances')
            .insert({
                user_id: user.id,
                tos_version: TOS_VERSION,
                ip_address: ipAddress,
                user_agent: userAgent.substring(0, 500)
            })

        if (insertError) {
            // Se unique constraint violation, già accettato (race condition)
            if (insertError.code === '23505') {
                console.log(`[accept-tos] Già accettato (constraint) per user ${user.id}`)
                return NextResponse.json(
                    { ok: true, alreadyAccepted: true },
                    { status: 409 }
                )
            }

            console.error('[accept-tos] Errore insert:', insertError)
            return NextResponse.json(
                { ok: false, error: 'insert_error' },
                { status: 500 }
            )
        }

        console.log(`[accept-tos] Accettazione registrata per user ${user.id}, versione ${TOS_VERSION}`)

        return NextResponse.json({
            ok: true,
            alreadyAccepted: false,
            tosVersion: TOS_VERSION
        })

    } catch (error) {
        console.error('[accept-tos] Errore interno:', error)
        return NextResponse.json(
            { ok: false, error: 'internal_error' },
            { status: 500 }
        )
    }
}
