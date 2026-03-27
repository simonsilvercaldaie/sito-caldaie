import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'simonsilvercaldaie@gmail.com').split(',').map(e => e.trim())

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    // SECURITY: Admin-only endpoint
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: { user: adminUser }, error: adminErr } = await supabaseAdmin.auth.getUser(token)
    if (adminErr || !adminUser || !ADMIN_EMAILS.includes(adminUser.email || '')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return allCookies
                },
                setAll(cookiesToSet) {
                    // No-op for debug
                }
            },
        }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    return NextResponse.json({
        status: 'debug_v2_secured',
        timestamp: new Date().toISOString(),
        cookies_count: allCookies.length,
        cookies_names: allCookies.map(c => c.name),
        user_found: !!user,
        user_id: user?.id,
        user_email: user?.email,
        auth_error: error?.message,
    })
}
