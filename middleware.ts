import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Paths that don't require authentication
const PUBLIC_PATHS = [
    '/',
    '/login',
    '/termini',
    '/privacy',
    '/contatti',
    '/catalogo',
    '/corso'
]

// Paths that require profile completion
const PROFILE_COMPLETION_PATH = '/completa-profilo'

// Paths to always skip middleware
const SKIP_PATHS = [
    '/auth/callback',
    '/api/',
    '/_next/',
    '/favicon.ico'
]

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Skip middleware for certain paths
    if (SKIP_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.next()
    }

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, {
                            ...options,
                            httpOnly: false,
                        })
                    )
                },
            },
        }
    )

    // Refresh session - IMPORTANT: keeps session cookies updated
    const { data: { user } } = await supabase.auth.getUser()

    // Check if path is public
    const isPublicPath = PUBLIC_PATHS.some(p =>
        pathname === p ||
        pathname.startsWith('/catalogo') ||
        pathname.startsWith('/corso/')
    )

    // If user is logged in and NOT on a public path or profile completion
    if (user && !isPublicPath && pathname !== PROFILE_COMPLETION_PATH) {
        // Check if profile is completed
        const { data: profile } = await supabase
            .from('profiles')
            .select('profile_completed')
            .eq('id', user.id)
            .maybeSingle()

        // If profile exists but not completed, redirect to completion
        if (profile && profile.profile_completed === false) {
            const redirectUrl = new URL(PROFILE_COMPLETION_PATH, request.url)
            return NextResponse.redirect(redirectUrl)
        }
    }

    // If user is on profile completion page but already completed, redirect home
    if (user && pathname === PROFILE_COMPLETION_PATH) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('profile_completed')
            .eq('id', user.id)
            .maybeSingle()

        if (profile?.profile_completed) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
}
