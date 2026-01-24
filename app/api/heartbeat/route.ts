import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
    console.log('[Heartbeat] START request')
    let user = null
    let authMethod = 'none'

    try {
        // 1. Check Service Role Key validity
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('[Heartbeat] CRITICAL: Missing SUPABASE_SERVICE_ROLE_KEY')
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
        }

        // 2. Try Cookie Auth (Preferred)
        try {
            const cookieStore = await cookies()
            const supabaseUser = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() { return cookieStore.getAll() },
                        setAll() { },
                    },
                }
            )
            const { data: { user: cookieUser }, error: cookieError } = await supabaseUser.auth.getUser()

            if (cookieUser) {
                user = cookieUser
                authMethod = 'cookie'
            } else {
                console.log('[Heartbeat] Cookie auth failed/empty:', cookieError?.message)
            }
        } catch (e: any) {
            console.log('[Heartbeat] Cookie extraction error:', e.message)
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 3. Fallback: Bearer Token
        if (!user) {
            const authHeader = req.headers.get('authorization')
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.replace('Bearer ', '')
                const { data: { user: tokenUser }, error: tokenError } = await supabaseAdmin.auth.getUser(token)

                if (tokenUser) {
                    user = tokenUser
                    authMethod = 'bearer'
                } else {
                    console.log('[Heartbeat] Bearer auth failed:', tokenError?.message)
                }
            } else {
                console.log('[Heartbeat] No Bearer token found')
            }
        }

        // 4. Validate Found User
        if (!user) {
            console.warn('[Heartbeat] No user found via Cookie or Bearer. Returning 200 (ignored).')
            // Return 200 to prevent errors in client console, but log warning on server
            return NextResponse.json({ ok: true, status: 'ignored_no_user' })
        }

        console.log(`[Heartbeat] User resolved via ${authMethod}: ${user.id} (${user.email})`)

        // 5. Perform Upsert
        const { error: upsertError } = await supabaseAdmin
            .from('user_presence')
            .upsert(
                { user_id: user.id, last_seen_at: new Date().toISOString() },
                { onConflict: 'user_id' }
            )

        if (upsertError) {
            console.error('[Heartbeat] Upsert Failed:', upsertError)
            return NextResponse.json({ error: 'DB Write Failed: ' + upsertError.message }, { status: 500 })
        }

        console.log('[Heartbeat] Success')
        return NextResponse.json({ ok: true, user_id: user.id, method: authMethod })

    } catch (e: any) {
        console.error('[Heartbeat] Unhandled Exception:', e)
        return NextResponse.json({ error: 'Internal Error: ' + e.message }, { status: 500 })
    }
}
