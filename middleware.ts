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
    '/corso',
    '/assistenza-caldaie-varese',
    '/guida-caldaie',
    '/pacchetto-completo',
    '/licenze-multidipendente'
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
                            httpOnly: true,
                        })
                    )
                },
            },
        }
    )

    const cleanPath = (pathname.endsWith('/') && pathname !== '/') ? pathname.slice(0, -1) : pathname
    const isPublicPath = PUBLIC_PATHS.includes(cleanPath) ||
        cleanPath.startsWith('/catalogo') ||
        cleanPath.startsWith('/corso') ||
        cleanPath.startsWith('/assistenza-caldaie-varese')

    // Public pages are accessible to everyone without login
    if (isPublicPath) {
        return supabaseResponse
    }

    // Refresh session for protected routes
    const { data: { user } } = await supabase.auth.getUser()

    // SECURITY: If user is not authenticated and path is not public, redirect to login
    if (!user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
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
