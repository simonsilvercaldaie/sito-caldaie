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
