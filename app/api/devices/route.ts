import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { DEVICE_RESET_COOLDOWN_DAYS } from '@/lib/constants'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function POST(request: NextRequest) {
    try {
        // 1. Auth
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

        // 2. Check cooldown
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('last_device_reset_at')
            .eq('id', user.id)
            .single()

        if (profile?.last_device_reset_at) {
            const lastReset = new Date(profile.last_device_reset_at)
            const cooldownEnd = new Date(lastReset)
            cooldownEnd.setDate(cooldownEnd.getDate() + DEVICE_RESET_COOLDOWN_DAYS)

            if (new Date() < cooldownEnd) {
                const daysRemaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                return NextResponse.json({
                    success: false,
                    error: `Puoi resettare i dispositivi tra ${daysRemaining} giorni.`
                }, { status: 429 })
            }
        }

        // 3. Delete all trusted devices
        const { error: deviceError } = await supabaseAdmin
            .from('trusted_devices')
            .delete()
            .eq('user_id', user.id)

        if (deviceError) {
            console.error('[devices/reset] Device delete error:', deviceError)
        }

        // 4. Delete all active sessions
        const { error: sessionError } = await supabaseAdmin
            .from('active_sessions')
            .delete()
            .eq('user_id', user.id)

        if (sessionError) {
            console.error('[devices/reset] Session delete error:', sessionError)
        }

        // 5. Update reset timestamp
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                last_device_reset_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (profileError) {
            console.error('[devices/reset] Profile update error:', profileError)
        }

        console.log(`[devices/reset] Devices reset for user: ${user.email}`)

        return NextResponse.json({ success: true })

    } catch (e) {
        console.error('[devices/reset] Unexpected error:', e)
        return NextResponse.json({ success: false, error: 'Errore interno' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        // 1. Auth
        const authHeader = request.headers.get('authorization') || ''
        const token = authHeader.replace(/^Bearer\s+/i, '').trim()
        if (!token) {
            return NextResponse.json({ error: 'Token mancante' }, { status: 401 })
        }

        const supabaseAdmin = getSupabaseAdmin()
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Token non valido' }, { status: 401 })
        }

        // 2. Get devices
        const { data: devices, error: deviceError } = await supabaseAdmin
            .from('trusted_devices')
            .select('id, device_name, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (deviceError) {
            console.error('[devices/list] Error:', deviceError)
            return NextResponse.json({ devices: [] })
        }

        // 3. Check reset availability
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('last_device_reset_at')
            .eq('id', user.id)
            .single()

        let canReset = true
        let daysRemaining = 0

        if (profile?.last_device_reset_at) {
            const lastReset = new Date(profile.last_device_reset_at)
            const cooldownEnd = new Date(lastReset)
            cooldownEnd.setDate(cooldownEnd.getDate() + DEVICE_RESET_COOLDOWN_DAYS)

            if (new Date() < cooldownEnd) {
                canReset = false
                daysRemaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            }
        }

        return NextResponse.json({
            devices: devices || [],
            canReset,
            daysRemaining
        })

    } catch (e) {
        console.error('[devices/list] Unexpected error:', e)
        return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
    }
}
