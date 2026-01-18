import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { TOS_VERSION } from '@/lib/constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * POST /api/complete-purchase
 * 
 * PUNTO DI VERITÀ per il pagamento.
 * Verifica ToS + salva acquisto.
 * 
 * ENFORCEMENT:
 * - Se tos_acceptances non esiste per (user_id, TOS_VERSION) → 403
 * - Anche se chiamato direttamente senza UI, blocca
 * 
 * Body richiesto:
 * {
 *   "level": "Base" | "Intermedio" | "Avanzato",
 *   "courseTitles": ["Corso 1", "Corso 2", ...],
 *   "amountPaid": 49
 * }
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

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        })

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Sessione non valida', code: 'INVALID_SESSION' },
                { status: 401 }
            )
        }

        // ============================================
        // ENFORCEMENT: VERIFICA ToS OBBLIGATORIA
        // ============================================
        const { data: tosAcceptance, error: tosError } = await supabase
            .from('tos_acceptances')
            .select('id')
            .eq('user_id', user.id)
            .eq('tos_version', TOS_VERSION)
            .maybeSingle()

        if (tosError) {
            console.error('Errore verifica ToS:', tosError)
            return NextResponse.json(
                { error: 'Errore verifica Termini', code: 'TOS_CHECK_ERROR' },
                { status: 500 }
            )
        }

        if (!tosAcceptance) {
            // BLOCCO: ToS non accettato
            return NextResponse.json(
                {
                    error: 'Devi accettare i Termini e Condizioni prima di acquistare',
                    code: 'TOS_NOT_ACCEPTED',
                    requiredVersion: TOS_VERSION
                },
                { status: 403 }
            )
        }

        // ============================================
        // PROCEDI CON SALVATAGGIO ACQUISTO
        // ============================================
        const body = await request.json()
        const { level, courseTitles, amountPaid } = body

        if (!level || !courseTitles || !Array.isArray(courseTitles) || courseTitles.length === 0) {
            return NextResponse.json(
                { error: 'Dati acquisto non validi', code: 'INVALID_DATA' },
                { status: 400 }
            )
        }

        // Prepara record acquisti
        const purchaseRecords = courseTitles.map((title: string) => ({
            user_id: user.id,
            course_id: title,
            amount: (amountPaid || 0) / courseTitles.length
        }))

        // Inserisci acquisti (ignora duplicati)
        const { error: purchaseError } = await supabase
            .from('purchases')
            .upsert(purchaseRecords, { onConflict: 'user_id,course_id', ignoreDuplicates: true })

        if (purchaseError) {
            console.error('Errore salvataggio acquisto:', purchaseError)
            return NextResponse.json(
                { error: 'Errore salvataggio acquisto', code: 'PURCHASE_ERROR' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            userId: user.id,
            level: level,
            coursesUnlocked: courseTitles.length
        })

    } catch (error) {
        console.error('Errore complete-purchase:', error)
        return NextResponse.json(
            { error: 'Errore interno del server', code: 'INTERNAL_ERROR' },
            { status: 500 }
        )
    }
}
