// Price constants used server-side (in cents)
// VERITÀ UNICA PREZZI (Centesimi)
export const PRODUCT_PRICES_CENTS = {
    // Individual
    'base': 30000,       // 300 EUR
    'intermediate': 40000, // 400 EUR
    'advanced': 50000,   // 500 EUR
    'complete': 120000,  // 1200 EUR (prezzo pieno)
    'complete_bundle': 110000, // 1100 EUR (bundle scontato -100€)

    // Team (Complete)
    'team_5': 200000,    // 2000 EUR
    'team_10': 300000,   // 3000 EUR
    'team_25': 400000    // 4000 EUR
} as const

export type ProductCode = keyof typeof PRODUCT_PRICES_CENTS

export function getExpectedPriceCents(productCode: string): number {
    // Validazione stretta
    if (Object.prototype.hasOwnProperty.call(PRODUCT_PRICES_CENTS, productCode)) {
        return PRODUCT_PRICES_CENTS[productCode as ProductCode]
    }
    throw new Error(`Invalid product_code: ${productCode}`)
}
