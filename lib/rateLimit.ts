import { createClient } from '@supabase/supabase-js'

// Admin client for rate limiting (bypass RLS)
const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Check if a request has exceeded the rate limit.
 * Uses Supabase RPC atomic increment.
 * 
 * @param identifier Unique key (e.g. "purchase_ip_127.0.0.1")
 * @param limit Max requests allowed
 * @param windowSeconds Window duration in seconds
 * @param failOpen If true (default), allow request on DB error. If false, block.
 * @returns { success: boolean, count: number }
 */
export async function checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number,
    failOpen: boolean = true
): Promise<{ success: boolean; count: number }> {
    const supabase = getAdminClient()

    try {
        // Atomic increment via RPC
        const { data, error } = await supabase.rpc('increment_rate_limit', {
            row_key: identifier,
            window_seconds: windowSeconds
        })

        if (error) {
            console.error('Rate Limit RPC Error:', error)

            if (!failOpen) {
                // Fail CLOSED: Block request on error
                return { success: false, count: limit + 1 }
            }
            // Fail OPEN: Allow request
            return { success: true, count: 0 }
        }

        const result = data as { success: boolean, count: number }
        return {
            success: result.success && result.count <= limit,
            count: result.count
        }

    } catch (e) {
        console.error('Rate limit exception:', e)
        if (!failOpen) {
            // Fail CLOSED
            return { success: false, count: limit + 1 }
        }
        // Fail OPEN
        return { success: true, count: 0 }
    }
}
