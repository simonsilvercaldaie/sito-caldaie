import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Sanitize user input: strip HTML tags and limit length.
 * Prevents XSS stored attacks.
 */
export function sanitizeInput(input: string, maxLength: number = 5000): string {
    if (!input || typeof input !== 'string') return ''
    return input
        .replace(/<[^>]*>/g, '')          // Remove HTML tags
        .replace(/javascript:/gi, '')      // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '')        // Remove event handlers (onclick=, onerror=, etc.)
        .trim()
        .slice(0, maxLength)
}
