/**
 * Device Fingerprint - Client-side device identification
 * Genera un hash unico per identificare il dispositivo
 */

/**
 * Genera un ID dispositivo basato su caratteristiche del browser
 * Nota: Non è un fingerprint perfetto, ma sufficiente per l'uso case
 */
export async function generateDeviceId(): Promise<string> {
    const components = [
        // User Agent
        navigator.userAgent,
        // Lingua
        navigator.language,
        // Screen
        screen.width.toString(),
        screen.height.toString(),
        screen.colorDepth.toString(),
        // Timezone
        new Date().getTimezoneOffset().toString(),
        // Hardware
        (navigator.hardwareConcurrency || 0).toString(),
        // Platform
        navigator.platform || 'unknown',
        // Touch support
        ('ontouchstart' in window).toString(),
        // WebGL vendor (if available)
        await getWebGLInfo()
    ]

    const fingerprint = components.join('|')

    // Create SHA-256 hash
    const encoder = new TextEncoder()
    const data = encoder.encode(fingerprint)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Ottiene informazioni WebGL per fingerprinting addizionale
 */
async function getWebGLInfo(): Promise<string> {
    try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

        if (!gl || !(gl instanceof WebGLRenderingContext)) {
            return 'no-webgl'
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || ''
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
            return `${vendor}:${renderer}`
        }

        return 'webgl-no-debug'
    } catch {
        return 'webgl-error'
    }
}

/**
 * Genera un nome leggibile per il dispositivo
 */
export function getDeviceName(): string {
    const ua = navigator.userAgent

    // Detect OS
    let os = 'Unknown OS'
    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Mac OS')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

    // Detect Browser
    let browser = 'Unknown Browser'
    if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Edg/')) browser = 'Edge'
    else if (ua.includes('Chrome')) browser = 'Chrome'
    else if (ua.includes('Safari')) browser = 'Safari'

    return `${browser} su ${os}`
}

/**
 * Salva il session token nel localStorage
 */
export function saveSessionToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('ssc_session_token', token)
    }
}

/**
 * Recupera il session token dal localStorage
 */
export function getSessionToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('ssc_session_token')
    }
    return null
}

/**
 * Rimuove il session token dal localStorage
 */
export function clearSessionToken(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('ssc_session_token')
    }
}
