// Costanti di configurazione per il sistema di licenze e pagamenti
// Centralizza le configurazioni per coerenza tra frontend e backend

// ============================================
// TERMINI E CONDIZIONI
// ============================================
export const TOS_VERSION = '2026-01-18-v1'

// ============================================
// CONFIGURAZIONE PAGAMENTI
// ============================================

// Interruttore pagamenti SERVER-SIDE (Kill Switch)
// Deve essere usato dalle API per bloccare le transazioni
export const AUTH_MODE = 'google_only' as const
export const SERVER_PAYMENTS_ENABLED = process.env.PAYMENTS_ENABLED === 'true'

// Interruttore pagamenti CLIENT-SIDE (UI Toggle)
// Usato per nascondere pulsanti, ma la sicurezza reale è sul server
export const UI_PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true'

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

// ============================================
// EMAIL NOTIFICHE
// ============================================

// Email per notifiche fatturazione (acquisti aziendali)
export const INVOICE_NOTIFICATION_EMAIL = 'fatture@simonsilvercaldaie.it'
