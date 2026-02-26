// Logica di pricing per Pacchetti Livello
// Prezzi: Base €200, Intermedio €400, Avanzato €600

export const ADMIN_TEST_EMAIL = 'simonsilvercaldaie@gmail.com'

export const PRICES = {
    PACK_BASE: 200,
    PACK_INTERMEDIO: 400,
    PACK_AVANZATO: 600,
} as const

export interface LevelPricingResult {
    amountToPay: number
    levelName: string
    courseCount: number
}

/**
 * Restituisce €1 se l'email è dell'admin, altrimenti il prezzo reale
 */
export function getTestPrice(realPrice: number, userEmail?: string | null): number {
    if (userEmail === ADMIN_TEST_EMAIL) return 1
    return realPrice
}

/**
 * Restituisce il prezzo del pacchetto per un determinato livello
 */
export function getLevelPricing(level: "Base" | "Intermedio" | "Avanzato" | "Laboratorio"): LevelPricingResult {
    switch (level) {
        case "Base":
            return {
                amountToPay: PRICES.PACK_BASE,
                levelName: "Base",
                courseCount: 9
            }
        case "Intermedio":
            return {
                amountToPay: PRICES.PACK_INTERMEDIO,
                levelName: "Intermedio",
                courseCount: 9
            }
        case "Avanzato":
            return {
                amountToPay: PRICES.PACK_AVANZATO,
                levelName: "Avanzato",
                courseCount: 9
            }
        case "Laboratorio":
            return {
                amountToPay: 0, // Da definire
                levelName: "Laboratorio",
                courseCount: 0
            }
        default:
            // Fallback di sicurezza
            return {
                amountToPay: PRICES.PACK_BASE,
                levelName: "Base",
                courseCount: 9
            }
    }
}

export function formatPrice(amount: number): string {
    return `€ ${amount.toFixed(2)}`
}
