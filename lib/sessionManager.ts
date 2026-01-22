/**
 * Session Manager - Server-side session and device management
 * Gestisce sessioni singole e dispositivi fidati
 */

import { createClient } from '@supabase/supabase-js'
import {
    MAX_DEVICES_PER_USER,
    SESSION_TTL_DAYS,
    DEVICE_RESET_COOLDOWN_DAYS
} from './constants'
import crypto from 'crypto'

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export type SessionResult = {
    success: true
    sessionToken: string
} | {
    success: false
    error: string
    errorCode: 'device_limit_reached' | 'session_creation_failed' | 'unknown'
}

export interface ValidationResult {
    valid: boolean
    error?: string
}

export interface DeviceResetResult {
    success: boolean
    error?: string
}

/**
 * Crea una nuova sessione per l'utente, invalidando eventuali sessioni precedenti
 * Verifica anche il limite dispositivi fidati
 */
export async function createSession(userId: string, deviceId: string, deviceName?: string): Promise<SessionResult> {
    const supabase = getSupabaseAdmin()

    try {
        // 1. Check trusted device limit using RPC function
        const { data: deviceCheck, error: deviceCheckError } = await supabase
            .rpc('check_device_limit', {
                p_user_id: userId,
                p_device_hash: deviceId
            })

        if (deviceCheckError) {
            console.error('Device check error:', deviceCheckError)
            // If RPC doesn't exist yet, fallback to manual check
            const { count } = await supabase
                .from('trusted_devices')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)

            const { data: existingDevice } = await supabase
                .from('trusted_devices')
                .select('id')
                .eq('user_id', userId)
                .eq('device_hash', deviceId)
                .maybeSingle()

            if (!existingDevice && (count || 0) >= MAX_DEVICES_PER_USER) {
                return {
                    success: false,
                    error: 'Hai raggiunto il limite di dispositivi consentiti per questo account.',
                    errorCode: 'device_limit_reached'
                }
            }
        } else if (deviceCheck && !deviceCheck.allowed) {
            return {
                success: false,
                error: 'Hai raggiunto il limite di dispositivi consentiti per questo account.',
                errorCode: 'device_limit_reached'
            }
        }

        // 2. Add device as trusted (upsert to handle duplicates)
        await supabase.from('trusted_devices').upsert({
            user_id: userId,
            device_hash: deviceId,
            device_name: deviceName || null
        }, {
            onConflict: 'user_id,device_hash',
            ignoreDuplicates: true
        })

        // 3. Invalidate existing sessions for this user (single session policy)
        await supabase
            .from('active_sessions')
            .delete()
            .eq('user_id', userId)

        // 4. Create new session
        const sessionToken = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS)

        const { error: insertError } = await supabase.from('active_sessions').insert({
            user_id: userId,
            session_token: sessionToken,
            device_id: deviceId,
            expires_at: expiresAt.toISOString()
        })

        if (insertError) {
            console.error('Session creation error:', insertError)
            return {
                success: false,
                error: 'Errore nella creazione della sessione. Riprova.',
                errorCode: 'session_creation_failed'
            }
        }

        return { success: true, sessionToken }

    } catch (e) {
        console.error('createSession exception:', e)
        return {
            success: false,
            error: 'Errore imprevisto. Riprova.',
            errorCode: 'unknown'
        }
    }
}

/**
 * Valida una sessione esistente e aggiorna last_seen_at
 */
export async function validateSession(userId: string, sessionToken: string): Promise<ValidationResult> {
    const supabase = getSupabaseAdmin()

    try {
        const { data: session, error } = await supabase
            .from('active_sessions')
            .select('id, expires_at')
            .eq('user_id', userId)
            .eq('session_token', sessionToken)
            .maybeSingle()

        if (error || !session) {
            return {
                valid: false,
                error: 'Hai effettuato l\'accesso da un altro dispositivo. Questa sessione è stata chiusa.'
            }
        }

        // Check expiration
        if (new Date(session.expires_at) < new Date()) {
            // Cleanup expired session
            await supabase.from('active_sessions').delete().eq('id', session.id)
            return {
                valid: false,
                error: 'Sessione scaduta. Effettua nuovamente l\'accesso.'
            }
        }

        // Update last_seen_at
        await supabase.from('active_sessions').update({
            last_seen_at: new Date().toISOString()
        }).eq('id', session.id)

        return { valid: true }

    } catch (e) {
        console.error('validateSession exception:', e)
        return { valid: false, error: 'Errore validazione sessione.' }
    }
}

/**
 * Invalida la sessione corrente (logout)
 */
export async function invalidateSession(userId: string, sessionToken: string): Promise<void> {
    const supabase = getSupabaseAdmin()

    await supabase
        .from('active_sessions')
        .delete()
        .eq('user_id', userId)
        .eq('session_token', sessionToken)
}

/**
 * Verifica se l'utente può resettare i dispositivi (cooldown 30 giorni)
 */
export async function canResetDevices(userId: string): Promise<{ canReset: boolean; daysRemaining?: number }> {
    const supabase = getSupabaseAdmin()

    try {
        // Try RPC first
        const { data, error } = await supabase.rpc('can_reset_devices', { p_user_id: userId })

        if (!error && data) {
            return {
                canReset: data.can_reset,
                daysRemaining: data.days_remaining
            }
        }

        // Fallback to manual check
        const { data: profile } = await supabase
            .from('profiles')
            .select('last_device_reset_at')
            .eq('id', userId)
            .single()

        if (!profile?.last_device_reset_at) {
            return { canReset: true }
        }

        const lastReset = new Date(profile.last_device_reset_at)
        const cooldownEnd = new Date(lastReset)
        cooldownEnd.setDate(cooldownEnd.getDate() + DEVICE_RESET_COOLDOWN_DAYS)

        if (new Date() >= cooldownEnd) {
            return { canReset: true }
        }

        const daysRemaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return { canReset: false, daysRemaining }

    } catch (e) {
        console.error('canResetDevices exception:', e)
        return { canReset: false }
    }
}

/**
 * Resetta tutti i dispositivi fidati dell'utente
 */
export async function resetDevices(userId: string): Promise<DeviceResetResult> {
    const resetCheck = await canResetDevices(userId)

    if (!resetCheck.canReset) {
        return {
            success: false,
            error: `Puoi resettare i dispositivi tra ${resetCheck.daysRemaining} giorni.`
        }
    }

    const supabase = getSupabaseAdmin()

    try {
        // Delete all trusted devices
        await supabase.from('trusted_devices').delete().eq('user_id', userId)

        // Delete all sessions
        await supabase.from('active_sessions').delete().eq('user_id', userId)

        // Update reset timestamp
        await supabase.from('profiles').update({
            last_device_reset_at: new Date().toISOString()
        }).eq('id', userId)

        return { success: true }

    } catch (e) {
        console.error('resetDevices exception:', e)
        return { success: false, error: 'Errore durante il reset. Riprova.' }
    }
}

/**
 * Ottiene la lista dei dispositivi fidati per l'utente
 */
export async function getTrustedDevices(userId: string) {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
        .from('trusted_devices')
        .select('id, device_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('getTrustedDevices error:', error)
        return []
    }

    return data || []
}
