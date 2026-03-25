/**
 * Italian Fiscal Validation Utilities
 * 
 * Validates Codice Fiscale (check digit + name/surname cross-check)
 * and Partita IVA (check digit) for Italian invoicing compliance.
 */

// ============================================================
// CODICE FISCALE - Check Digit (Carattere di controllo)
// ============================================================

const CF_ODD_MAP: Record<string, number> = {
    '0': 1, '1': 0, '2': 5, '3': 7, '4': 9, '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
    'A': 1, 'B': 0, 'C': 5, 'D': 7, 'E': 9, 'F': 13, 'G': 15, 'H': 17, 'I': 19, 'J': 21,
    'K': 2, 'L': 4, 'M': 18, 'N': 20, 'O': 11, 'P': 3, 'Q': 6, 'R': 8, 'S': 12, 'T': 14,
    'U': 16, 'V': 10, 'W': 22, 'X': 25, 'Y': 24, 'Z': 23
}

const CF_EVEN_MAP: Record<string, number> = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9,
    'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19,
    'U': 20, 'V': 21, 'W': 22, 'X': 23, 'Y': 24, 'Z': 25
}

const CF_CHECK_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Validates the check digit (16th character) of an Italian Codice Fiscale.
 * Returns true if the check digit is correct.
 */
export function validateCFCheckDigit(cf: string): boolean {
    const upper = cf.trim().toUpperCase()
    if (upper.length !== 16) return false
    if (!/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(upper)) return false

    let sum = 0
    for (let i = 0; i < 15; i++) {
        const char = upper[i]
        // Odd positions (1-indexed) use odd map, even positions use even map
        if ((i + 1) % 2 === 1) {
            sum += CF_ODD_MAP[char] ?? 0
        } else {
            sum += CF_EVEN_MAP[char] ?? 0
        }
    }

    const expectedCheck = CF_CHECK_LETTERS[sum % 26]
    return upper[15] === expectedCheck
}

// ============================================================
// CODICE FISCALE - Cross-check with Name/Surname
// ============================================================

function extractConsonants(s: string): string {
    return s.toUpperCase().replace(/[^A-Z]/g, '').split('').filter(c => !'AEIOU'.includes(c)).join('')
}

function extractVowels(s: string): string {
    return s.toUpperCase().replace(/[^A-Z]/g, '').split('').filter(c => 'AEIOU'.includes(c)).join('')
}

/**
 * Generates the 3-character surname code for CF.
 * Takes consonants in order, then vowels, then pads with X.
 */
function cfSurnameCode(surname: string): string {
    const consonants = extractConsonants(surname)
    const vowels = extractVowels(surname)
    const pool = consonants + vowels
    return (pool + 'XXX').slice(0, 3)
}

/**
 * Generates the 3-character name code for CF.
 * If 4+ consonants → take 1st, 3rd, 4th.
 * If 3 consonants → take all 3.
 * If <3 → consonants + vowels, pad with X.
 */
function cfNameCode(name: string): string {
    const consonants = extractConsonants(name)
    if (consonants.length >= 4) {
        return consonants[0] + consonants[2] + consonants[3]
    }
    if (consonants.length === 3) {
        return consonants
    }
    const vowels = extractVowels(name)
    const pool = consonants + vowels
    return (pool + 'XXX').slice(0, 3)
}

/**
 * Cross-checks the first 6 characters of a CF against the provided name and surname.
 * Returns { valid: true } if they match, or { valid: false, message: string } if not.
 * 
 * Note: This is a heuristic check. Names with apostrophes, spaces, or unusual
 * formatting may cause false negatives. We handle common edge cases.
 */
export function crossCheckCFWithName(
    cf: string,
    firstName: string,
    lastName: string
): { valid: boolean; message?: string } {
    const upper = cf.trim().toUpperCase()
    if (upper.length !== 16) return { valid: false, message: 'Codice Fiscale deve essere di 16 caratteri' }

    const cfSurname = upper.slice(0, 3)
    const cfName = upper.slice(3, 6)

    // Clean names: remove accents, apostrophes, hyphens, spaces for compound names
    const cleanSurname = lastName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['-\s]/g, '')
    const cleanName = firstName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['-\s]/g, '')

    const expectedSurname = cfSurnameCode(cleanSurname)
    const expectedName = cfNameCode(cleanName)

    if (cfSurname !== expectedSurname) {
        return {
            valid: false,
            message: `Il Codice Fiscale non corrisponde al cognome "${lastName}" (atteso: ${expectedSurname}..., trovato: ${cfSurname}...)`
        }
    }

    if (cfName !== expectedName) {
        return {
            valid: false,
            message: `Il Codice Fiscale non corrisponde al nome "${firstName}" (atteso: ...${expectedName}..., trovato: ...${cfName}...)`
        }
    }

    return { valid: true }
}

// ============================================================
// PARTITA IVA - Check Digit (Cifra di controllo)
// ============================================================

/**
 * Validates the check digit (11th digit) of an Italian Partita IVA.
 * Uses the Luhn-like algorithm specified by Italian tax authority.
 * Returns true if the check digit is correct.
 */
export function validatePIVACheckDigit(piva: string): boolean {
    const clean = piva.trim()
    if (!/^\d{11}$/.test(clean)) return false

    const digits = clean.split('').map(Number)

    // Sum of odd-position digits (1-indexed: positions 1,3,5,7,9)
    let sumOdd = 0
    for (let i = 0; i < 10; i += 2) {
        sumOdd += digits[i]
    }

    // Sum for even-position digits (1-indexed: positions 2,4,6,8,10)
    let sumEven = 0
    for (let i = 1; i < 10; i += 2) {
        const doubled = digits[i] * 2
        sumEven += doubled > 9 ? doubled - 9 : doubled
    }

    const total = sumOdd + sumEven
    const checkDigit = (10 - (total % 10)) % 10

    return digits[10] === checkDigit
}

// ============================================================
// Combined validation result
// ============================================================

export interface ValidationResult {
    valid: boolean
    error?: string
}

/**
 * Validates a complete Codice Fiscale: format, check digit, and name cross-check.
 */
export function validateCodiceFiscale(
    cf: string,
    firstName: string,
    lastName: string
): ValidationResult {
    const upper = cf.trim().toUpperCase()

    // 1. Format check
    if (!/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(upper)) {
        return { valid: false, error: 'Il Codice Fiscale non è nel formato corretto (16 caratteri, es. "RSSMRA80A01H501U")' }
    }

    // 2. Check digit
    if (!validateCFCheckDigit(upper)) {
        return { valid: false, error: 'Il Codice Fiscale non è valido (carattere di controllo errato). Verifica di averlo digitato correttamente.' }
    }

    // 3. Cross-check with name/surname
    const crossCheck = crossCheckCFWithName(upper, firstName, lastName)
    if (!crossCheck.valid) {
        return { valid: false, error: crossCheck.message || 'Il Codice Fiscale non corrisponde al nome e cognome inseriti' }
    }

    return { valid: true }
}

/**
 * Validates an Italian Partita IVA: format and check digit.
 */
export function validatePartitaIVA(piva: string): ValidationResult {
    const clean = piva.trim()

    if (!/^\d{11}$/.test(clean)) {
        return { valid: false, error: 'La Partita IVA deve essere di 11 cifre (es. "12345678901")' }
    }

    if (!validatePIVACheckDigit(clean)) {
        return { valid: false, error: 'La Partita IVA non è valida (cifra di controllo errata). Verifica di averla digitata correttamente.' }
    }

    return { valid: true }
}
