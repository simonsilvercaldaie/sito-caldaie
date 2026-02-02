// Price constants used server-side (in cents)
// VERITÀ UNICA PREZZI (Centesimi)
export const PRODUCT_PRICES_CENTS = {
    // Individual
    'base': 20000,       // 200 EUR
    'intermediate': 40000, // 400 EUR
    'advanced': 60000,   // 600 EUR
    'complete': 120000,  // 1200 EUR (prezzo pieno singoli)
    'complete_bundle': 100000, // 1000 EUR (bundle scontato -200€)

    // Team (Complete)
    'team_5': 300000,    // 3000 EUR
    'team_10': 400000,   // 4000 EUR
    'team_25': 500000    // 5000 EUR
} as const

export type ProductCode = keyof typeof PRODUCT_PRICES_CENTS

export function getExpectedPriceCents(productCode: string): number {
    // Validazione stretta
    if (Object.prototype.hasOwnProperty.call(PRODUCT_PRICES_CENTS, productCode)) {
        return PRODUCT_PRICES_CENTS[productCode as ProductCode]
    }
    throw new Error(`Invalid product_code: ${productCode}`)
}
