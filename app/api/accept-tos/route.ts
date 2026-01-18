import { createClient } from '@supabase/supabase-js'
import { cookies, headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { TOS_VERSION } from '@/lib/constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * POST /api/accept-tos
 * 
 * Salva l'accettazione dei ToS con dati antifrode (IP, User-Agent).
 * Deve essere chiamata PRIMA del pagamento.
 * 
 * Raccoglie:
 * - user_id: dalla sessione autenticata
 * - tos_version: costante centralizzata
 * - ip_address: dall'header x-forwarded-for o x-real-ip
 * - user_agent: dall'header user-agent
 */
export async function POST(request: NextRequest) {
    try {
        // Leggi cookies di sessione Supabase
        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()
        const authCookie = allCookies.find(c => c.name.includes('auth-token'))

        if (!authCookie) {
            return NextResponse.json(
                { error: 'Non autenticato', code: 'NO_SESSION_COOKIE' },
                { status: 401 }
            )
        }

        // Estrai access token
        let accessToken: string
        try {
            const parsed = JSON.parse(authCookie.value)
            accessToken = parsed.access_token || parsed[0]?.access_token
        } catch {
            accessToken = authCookie.value
        }

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Token sessione non valido', code: 'INVALID_TOKEN' },
                { status: 401 }
            )
        }

        // Crea client Supabase
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        })

        // Verifica sessione
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Sessione non valida', code: 'INVALID_SESSION' },
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
                    user_agent: userAgent.substring(0, 500) // Limita lunghezza
                },
                { onConflict: 'user_id,tos_version', ignoreDuplicates: true }
            )

        if (tosError) {
            console.error('Errore salvataggio ToS:', tosError)
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

        return NextResponse.json({
            success: true,
            tosVersion: TOS_VERSION,
            acceptedAt: tosCheck.accepted_at
        })

    } catch (error) {
        console.error('Errore accept-tos:', error)
        return NextResponse.json(
            { error: 'Errore interno del server', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}
