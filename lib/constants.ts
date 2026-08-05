// Costanti di configurazione per il sistema di licenze e pagamenti
// Centralizza le configurazioni per coerenza tra frontend e backend

// ============================================
// TERMINI E CONDIZIONI
// ============================================
export const TOS_VERSION = '2026-08-06-v2'

// ============================================
// CONFIGURAZIONE PAGAMENTI
// ============================================

// Interruttore pagamenti SERVER-SIDE (Kill Switch)
// Deve essere usato dalle API per bloccare le transazioni
// DEFAULT: ATTIVO — per disattivare, impostare PAYMENTS_ENABLED=false su Vercel
export const AUTH_MODE = 'google_only' as const
export const SERVER_PAYMENTS_ENABLED = process.env.PAYMENTS_ENABLED !== 'false'

// Interruttore pagamenti CLIENT-SIDE (UI Toggle)
// Usato per nascondere pulsanti, ma la sicurezza reale è sul server
// DEFAULT: ATTIVO — per disattivare, impostare NEXT_PUBLIC_PAYMENTS_ENABLED=false su Vercel
export const UI_PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED !== 'false'

// Ambiente PayPal: 'sandbox' o 'live'
export const PAYPAL_ENV = (process.env.NEXT_PUBLIC_PAYPAL_ENV || 'sandbox') as 'sandbox' | 'live'

// URL API PayPal in base all'ambiente
export const PAYPAL_API_URL = PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

// Client ID PayPal (pubblico, usato dal frontend)
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''

// ============================================
// PROTEZIONE ACCESSI
// ============================================

// Numero massimo di dispositivi fidati per utente
export const MAX_DEVICES_PER_USER = 2

// Numero massimo di sessioni contemporanee (soft limit via invalidazione)
export const MAX_CONCURRENT_SESSIONS = 1

// Durata sessione in giorni
export const SESSION_TTL_DAYS = 7

// Giorni di cooldown tra reset dispositivi
export const DEVICE_RESET_COOLDOWN_DAYS = 30

// BUDGET MINUTI VIDEO
export const VIDEO_DURATION_SECONDS = 1320      // 22 min (durata standard video)
export const MAX_VIDEO_BUDGET_SECONDS = 3960    // 66 min (3× durata video)
export const BUDGET_REGEN_SECONDS = 1320        // 22 min ripristinati per periodo
export const BUDGET_REGEN_DAYS = 30             // ogni 30 giorni di inattività
export const BUDGET_GRACE_HOURS = 2             // ricarica pagina entro 2h = stessa sessione
export const EXEMPT_LICENSE_TYPES = ['scuola_10'] // product_code senza limite budget

// ============================================
// FATTURE IN CLOUD
// ============================================

// Kill switch per integrazione Fatture in Cloud
// DEFAULT: DISATTIVO — per attivare, impostare FIC_ENABLED=true su Vercel
export const FIC_ENABLED = process.env.FIC_ENABLED === 'true'
