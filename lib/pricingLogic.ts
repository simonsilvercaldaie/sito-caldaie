// Logica di pricing per Pacchetti Livello
// Prezzi: Base €300, Intermedio €400, Avanzato €500
// Non esistono acquisti singoli.

export const PRICES = {
    PACK_BASE: 300,
    PACK_INTERMEDIO: 400,
    PACK_AVANZATO: 500,
} as const

export interface LevelPricingResult {
    amountToPay: number
    levelName: string
    courseCount: number
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
