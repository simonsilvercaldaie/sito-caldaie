'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { generateDeviceId, getDeviceName, saveSessionToken, getSessionToken, clearSessionToken } from '@/lib/deviceFingerprint'
import { supabase } from '@/lib/supabaseClient'

const HEARTBEAT_INTERVAL_MS = 60_000 // 60 seconds

export type SessionGuardStatus = 'idle' | 'connecting' | 'active' | 'kicked' | 'device_limit' | 'error'

interface UseSessionGuardOptions {
    /** Whether to activate the guard (only when user has purchased & is watching premium) */
    enabled: boolean
}

interface UseSessionGuardReturn {
    status: SessionGuardStatus
    errorMessage: string | null
}

/**
 * Hook that manages session creation and periodic heartbeat validation.
 * 
 * When enabled:
 * 1. Generates a device fingerprint
 * 2. Creates a server session via POST /api/session
 * 3. Saves the session token in localStorage
 * 4. Heartbeats every 60s via PUT /api/session
 * 5. If kicked (another device logged in), sets status to 'kicked'
 * 6. If device limit reached, sets status to 'device_limit'
 */
export function useSessionGuard({ enabled }: UseSessionGuardOptions): UseSessionGuardReturn {
    const [status, setStatus] = useState<SessionGuardStatus>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null)
    const sessionTokenRef = useRef<string | null>(null)
    const isInitializedRef = useRef(false)

    const getAccessToken = useCallback(async (): Promise<string | null> => {
        const { data: { session } } = await supabase.auth.getSession()
        return session?.access_token || null
    }, [])

    // Create session
    const initSession = useCallback(async () => {
        if (isInitializedRef.current) return
        isInitializedRef.current = true

        setStatus('connecting')

        try {
            const accessToken = await getAccessToken()
            if (!accessToken) {
                setStatus('error')
                setErrorMessage('Sessione di autenticazione scaduta. Rieffettua il login.')
                return
            }

            const deviceId = await generateDeviceId()
            const deviceName = getDeviceName()

            const res = await fetch('/api/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ deviceId, deviceName })
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.errorCode === 'device_limit_reached') {
                    setStatus('device_limit')
                    setErrorMessage(data.error || 'Hai raggiunto il limite di dispositivi (max 2). Resetta dalla Dashboard.')
                } else {
                    setStatus('error')
                    setErrorMessage(data.error || 'Errore nella creazione della sessione.')
                }
                return
            }

            // Session created successfully
            sessionTokenRef.current = data.sessionToken
            saveSessionToken(data.sessionToken)
            setStatus('active')
            setErrorMessage(null)

            // Start heartbeat
            startHeartbeat(accessToken, data.sessionToken)

        } catch (e) {
            console.error('[useSessionGuard] Init error:', e)
            setStatus('error')
            setErrorMessage('Errore di connessione. Riprova.')
        }
    }, [getAccessToken])

    // Heartbeat
    const startHeartbeat = useCallback((accessToken: string, sessionToken: string) => {
        // Clear any existing heartbeat
        if (heartbeatRef.current) {
            clearInterval(heartbeatRef.current)
        }

        heartbeatRef.current = setInterval(async () => {
            try {
                // Re-get access token in case it refreshed
                const freshToken = await getAccessToken()
                if (!freshToken) {
                    setStatus('error')
                    setErrorMessage('Sessione di autenticazione scaduta.')
                    if (heartbeatRef.current) clearInterval(heartbeatRef.current)
                    return
                }

                const res = await fetch('/api/session', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${freshToken}`
                    },
                    body: JSON.stringify({ sessionToken })
                })

                if (!res.ok) {
                    const data = await res.json()
                    console.warn('[useSessionGuard] Heartbeat failed:', data.error)
                    setStatus('kicked')
                    setErrorMessage(data.error || 'La tua sessione è stata chiusa perché hai effettuato l\'accesso da un altro dispositivo.')
                    clearSessionToken()
                    if (heartbeatRef.current) clearInterval(heartbeatRef.current)
                }
            } catch (e) {
                // Network error — don't kick user on transient failures
                console.warn('[useSessionGuard] Heartbeat network error:', e)
            }
        }, HEARTBEAT_INTERVAL_MS)
    }, [getAccessToken])

    // Lifecycle
    useEffect(() => {
        if (enabled) {
            initSession()
        }

        return () => {
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current)
                heartbeatRef.current = null
            }
        }
    }, [enabled, initSession])

    // Reset when disabled
    useEffect(() => {
        if (!enabled) {
            isInitializedRef.current = false
            setStatus('idle')
            setErrorMessage(null)
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current)
                heartbeatRef.current = null
            }
        }
    }, [enabled])

    return { status, errorMessage }
}
