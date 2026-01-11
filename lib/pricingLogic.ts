// Logica di pricing intelligente con bundle automatici
// Prezzi: Singolo €39, Bundle 5 €149, Bundle 10 €298

export const PRICES = {
    SINGLE: 39,
    BUNDLE_5: 149,
    BUNDLE_10: 298,
} as const

export interface PricingResult {
    amountToPay: number           // Quanto pagare ora
    coursesToUnlock: number       // Quanti corsi sbloccare (incluso quello richiesto)
    totalAfterPurchase: number    // Totale corsi dopo acquisto
    totalSpentAfter: number       // Totale speso dopo acquisto
    savingsMessage?: string       // Messaggio risparmio
    isBundleUpgrade: boolean      // Se è un upgrade a bundle
}

/**
 * Calcola il prezzo ottimale per il prossimo acquisto
 * 
 * @param ownedCount - Numero di corsi già acquistati
 * @param totalSpent - Totale già speso dall'utente
 * @returns PricingResult con importo da pagare e corsi da sbloccare
 */
export function calculateNextPurchase(ownedCount: number, totalSpent: number): PricingResult {
    const remaining = 10 - ownedCount

    if (remaining <= 0) {
        return {
            amountToPay: 0,
            coursesToUnlock: 0,
            totalAfterPurchase: 10,
            totalSpentAfter: totalSpent,
            savingsMessage: "Hai già tutti i corsi!",
            isBundleUpgrade: false
        }
    }

    // Caso 1: Utente ha 0-4 corsi → controlla se conviene il bundle 5
    if (ownedCount < 5) {
        const regularPrice = PRICES.SINGLE
        const wouldPayTotal = totalSpent + regularPrice

        // Se pagando il singolo supererebbe €149, offri bundle 5
        if (wouldPayTotal > PRICES.BUNDLE_5) {
            const amountForBundle5 = PRICES.BUNDLE_5 - totalSpent
            const coursesToGet = 5 - ownedCount

            return {
                amountToPay: Math.max(0, amountForBundle5),
                coursesToUnlock: coursesToGet,
                totalAfterPurchase: 5,
                totalSpentAfter: PRICES.BUNDLE_5,
                savingsMessage: `🎁 Paga solo €${amountForBundle5.toFixed(2)} e ottieni ${coursesToGet} corsi! (Risparmi €${(coursesToGet * PRICES.SINGLE - amountForBundle5).toFixed(2)})`,
                isBundleUpgrade: true
            }
        }

        // Altrimenti prezzo singolo normale
        return {
            amountToPay: regularPrice,
            coursesToUnlock: 1,
            totalAfterPurchase: ownedCount + 1,
            totalSpentAfter: totalSpent + regularPrice,
            isBundleUpgrade: false
        }
    }

    // Caso 2: Utente ha 5-9 corsi → controlla se conviene il bundle 10
    if (ownedCount >= 5 && ownedCount < 10) {
        const regularPrice = PRICES.SINGLE
        const wouldPayTotal = totalSpent + regularPrice

        // Se pagando il singolo supererebbe €298, offri bundle 10
        if (wouldPayTotal > PRICES.BUNDLE_10) {
            const amountForBundle10 = PRICES.BUNDLE_10 - totalSpent
            const coursesToGet = 10 - ownedCount

            return {
                amountToPay: Math.max(0, amountForBundle10),
                coursesToUnlock: coursesToGet,
                totalAfterPurchase: 10,
                totalSpentAfter: PRICES.BUNDLE_10,
                savingsMessage: `🎁 Paga solo €${amountForBundle10.toFixed(2)} e ottieni TUTTI i ${coursesToGet} corsi rimanenti! (Risparmi €${(coursesToGet * PRICES.SINGLE - amountForBundle10).toFixed(2)})`,
                isBundleUpgrade: true
            }
        }

        // Altrimenti prezzo singolo normale
        return {
            amountToPay: regularPrice,
            coursesToUnlock: 1,
            totalAfterPurchase: ownedCount + 1,
            totalSpentAfter: totalSpent + regularPrice,
            isBundleUpgrade: false
        }
    }

    // Fallback
    return {
        amountToPay: PRICES.SINGLE,
        coursesToUnlock: 1,
        totalAfterPurchase: ownedCount + 1,
        totalSpentAfter: totalSpent + PRICES.SINGLE,
        isBundleUpgrade: false
    }
}

/**
 * Formatta il prezzo per la visualizzazione
 */
export function formatPrice(amount: number): string {
    return `€ ${amount.toFixed(2)}`
}

/**
 * Calcola il risparmio totale se si compra il bundle
 */
export function calculateBundleSavings(bundleType: 5 | 10): { bundlePrice: number; regularPrice: number; savings: number } {
    const bundlePrice = bundleType === 5 ? PRICES.BUNDLE_5 : PRICES.BUNDLE_10
    const regularPrice = bundleType * PRICES.SINGLE
    return {
        bundlePrice,
        regularPrice,
        savings: regularPrice - bundlePrice
    }
}
