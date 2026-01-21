
// Price constants used server-side (in cents)
// VERITÀ UNICA PREZZI (Centesimi)
export const PRODUCT_PRICES_CENTS = {
    // Individual
    'base': 20000,       // 200 EUR
    'intermediate': 30000, // 300 EUR
    'advanced': 40000,   // 400 EUR
    'complete': 90000,   // 900 EUR

    // Team (Complete)
    'team_5': 150000,    // 1500 EUR
    'team_10': 200000,   // 2000 EUR
    'team_25': 300000    // 3000 EUR
} as const

export type ProductCode = keyof typeof PRODUCT_PRICES_CENTS

export function getExpectedPriceCents(productCode: string): number {
    // Validazione stretta
    if (Object.prototype.hasOwnProperty.call(PRODUCT_PRICES_CENTS, productCode)) {
        return PRODUCT_PRICES_CENTS[productCode as ProductCode]
    }
    throw new Error(`Invalid product_code: ${productCode}`)
}
