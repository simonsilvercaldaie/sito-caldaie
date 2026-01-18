// Mappa prezzi server-side ONLY
// NON ESPORTARE AL CLIENT - usato solo in /api/complete-purchase

export const SERVER_PRICES: Record<string, number> = {
    'Base': 200,
    'Intermedio': 300,
    'Avanzato': 400,
}

/**
 * Calcola il prezzo atteso per un livello.
 * Da usare SOLO lato server per validare i pagamenti.
 */
export function getExpectedPrice(level: string): number | null {
    return SERVER_PRICES[level] ?? null
}
