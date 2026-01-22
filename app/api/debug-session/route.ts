import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET() {
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
        status: 'debug',
        cookies_count: allCookies.length,
        cookies_names: allCookies.map(c => c.name),
        cookies: allCookies.map(c => ({
            name: c.name,
            value: c.value.substring(0, 10) + '...', // Mask values
            domain: c.domain,
            path: c.path,
            secure: c.secure,
            sameSite: c.sameSite
        })),
        user_found: !!user,
        user_id: user?.id,
        user_email: user?.email,
        auth_error: error?.message,
        env_site_url: process.env.NEXT_PUBLIC_SUPABASE_URL
    })
}
