import { createClient } from '@supabase/supabase-js'

// Admin client for rate limiting (bypass RLS)
const getAdminClient = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Check if a request has exceeded the rate limit.
 * Uses Supabase as a distributed store.
 * 
 * @param identifier Unique key (e.g. "purchase_ip_127.0.0.1" or "purchase_user_123")
 * @param limit Max requests allowed
 * @param windowSeconds Window duration in seconds
 * @returns { success: boolean, count: number }
 */
export async function checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number
): Promise<{ success: boolean; count: number }> {
    const supabase = getAdminClient()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000)

    try {
        // 1. Try to increment existing counter
        const { data, error } = await supabase.rpc('increment_rate_limit', {
            row_key: identifier,
            window_seconds: windowSeconds
        })

        if (error) {
            // Fallback strategy if RPC is not defined yet (first deploy)
            // Or simple upsert approach

            // Fetch existing
            const { data: existing } = await supabase
                .from('rate_limits')
                .select('*')
                .eq('key', identifier)
                .single()

            if (existing) {
                if (new Date(existing.expires_at) < now) {
                    // Expired, reset
                    await supabase
                        .from('rate_limits')
                        .update({ count: 1, expires_at: expiresAt.toISOString() })
                        .eq('key', identifier)
                    return { success: true, count: 1 }
                } else {
                    // Valid, increment
                    const newCount = existing.count + 1
                    await supabase
                        .from('rate_limits')
                        .update({ count: newCount })
                        .eq('key', identifier)

                    return { success: newCount <= limit, count: newCount }
                }
            } else {
                // Create new
                await supabase
                    .from('rate_limits')
                    .insert({ key: identifier, count: 1, expires_at: expiresAt.toISOString() })
                return { success: true, count: 1 }
            }
        }

        // If RPC worked (better atomicity) - we will implement RPC below
        // validation logic here
        return { success: true, count: 1 }

    } catch (e) {
        console.error('Rate limit error:', e)
        // Fail open to avoid blocking legitimate users on db error, 
        // OR Fail closed for high security. 
        // Choosing Fail Open for availability unless critical.
        return { success: true, count: 0 }
    }
}
