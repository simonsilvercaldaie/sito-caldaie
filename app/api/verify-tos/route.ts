import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { TOS_VERSION } from '@/lib/constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * POST /api/verify-tos
 * 
 * Verifica che l'utente autenticato abbia accettato i ToS correnti.
 * 
 * AUTENTICAZIONE:
 * - Legge il token di sessione dai cookies Supabase (sb-*-auth-token)
 * - NON accetta token passati dal client nell'header (hardening)
 * - Valida il token con supabase.auth.getUser() che verifica lato server Supabase
 * 
 * RISCHI RESIDUI:
 * - Se i cookies sono rubati (XSS), l'attaccante può impersonare l'utente
 * - Mitigazione: HttpOnly cookies (default Supabase), CSP headers, HTTPS only
 */
export async function POST(request: NextRequest) {
    try {
        // Leggi cookies di sessione Supabase
        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()

        // Trova il token di sessione Supabase (formato: sb-<project-ref>-auth-token)
        const authCookie = allCookies.find(c => c.name.includes('auth-token'))

        if (!authCookie) {
            return NextResponse.json(
                { error: 'Non autenticato', code: 'NO_SESSION_COOKIE' },
                { status: 401 }
            )
        }

        // Parsa il cookie (può essere JSON con access_token e refresh_token)
        let accessToken: string
        try {
            const parsed = JSON.parse(authCookie.value)
            accessToken = parsed.access_token || parsed[0]?.access_token
        } catch {
            // Se non è JSON, usa il valore diretto
            accessToken = authCookie.value
        }

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Token sessione non valido', code: 'INVALID_TOKEN' },
                { status: 401 }
            )
        }

        // Crea client Supabase con il token estratto dai cookies
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        })

        // Verifica sessione con il server Supabase (validazione reale, non solo parsing JWT)
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Sessione scaduta o non valida', code: 'INVALID_SESSION' },
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
            console.error('Errore verifica ToS:', tosError)
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

        // ToS accettato → consenti procedere
        return NextResponse.json({
            success: true,
            userId: user.id,
            tosAccepted: true,
            tosVersion: TOS_VERSION,
            acceptedAt: tosAcceptance.accepted_at
        })

    } catch (error) {
        console.error('Errore verifica checkout:', error)
        return NextResponse.json(
            { error: 'Errore interno del server', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}
