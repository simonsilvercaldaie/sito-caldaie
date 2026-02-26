import { NextRequest, NextResponse } from 'next/server'
import { createSession, validateSession } from '@/lib/sessionManager'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

/**
 * POST /api/session — Crea una nuova sessione
 * Body: { deviceId: string, deviceName: string }
 * Returns: { success: true, sessionToken: string } | { success: false, error: string, errorCode: string }
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        if (!token) {
            return NextResponse.json({ success: false, error: 'Token mancante' }, { status: 401 })
        }

        const supabaseAdmin = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Token non valido' }, { status: 401 })
        }

        // 2. Parse body
        const body = await request.json()
        const { deviceId, deviceName } = body

        if (!deviceId) {
            return NextResponse.json({ success: false, error: 'deviceId mancante' }, { status: 400 })
        }

        // 3. Create session (handles device limit check + old session invalidation)
        const result = await createSession(user.id, deviceId, deviceName)

        if (!result.success) {
            const status = result.errorCode === 'device_limit_reached' ? 403 : 500
            return NextResponse.json({
                success: false,
                error: result.error,
                errorCode: result.errorCode
            }, { status })
        }

        console.log(`[session/create] Session created for ${user.email} on ${deviceName || 'unknown device'}`)

        return NextResponse.json({
            success: true,
            sessionToken: result.sessionToken
        })

    } catch (e) {
        console.error('[session/create] Unexpected error:', e)
        return NextResponse.json({ success: false, error: 'Errore interno' }, { status: 500 })
    }
}

/**
 * PUT /api/session — Heartbeat / Valida sessione
 * Body: { sessionToken: string }
 * Returns: { valid: true } | { valid: false, error: string }
 */
export async function PUT(request: NextRequest) {
    try {
        // 1. Authenticate
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        if (!token) {
            return NextResponse.json({ valid: false, error: 'Token mancante' }, { status: 401 })
        }

        const supabaseAdmin = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ valid: false, error: 'Token non valido' }, { status: 401 })
        }

        // 2. Parse body
        const body = await request.json()
        const { sessionToken } = body

        if (!sessionToken) {
            return NextResponse.json({ valid: false, error: 'sessionToken mancante' }, { status: 400 })
        }

        // 3. Validate session
        const result = await validateSession(user.id, sessionToken)

        if (!result.valid) {
            return NextResponse.json({
                valid: false,
                error: result.error || 'Sessione non valida'
            }, { status: 403 })
        }

        return NextResponse.json({ valid: true })

    } catch (e) {
        console.error('[session/heartbeat] Unexpected error:', e)
        return NextResponse.json({ valid: false, error: 'Errore interno' }, { status: 500 })
    }
}
