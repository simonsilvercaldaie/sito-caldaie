import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`)
    }

    // Create SSR client for cookie management
    let supabaseResponse = NextResponse.redirect(`${requestUrl.origin}/`)

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    try {
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('[auth/callback] Session exchange error:', error)
            return NextResponse.redirect(`${requestUrl.origin}/login?error=session_failed`)
        }

        if (!user) {
            console.error('[auth/callback] No user returned')
            return NextResponse.redirect(`${requestUrl.origin}/login?error=no_user`)
        }

        // Admin client per operazioni privilegiate
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Check/Create profile
        const { data: existingProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, profile_completed')
            .eq('id', user.id)
            .maybeSingle()

        if (profileError) {
            console.error('[auth/callback] Profile query error:', profileError)
        }

        if (!existingProfile) {
            // First-time authentication - create profile
            console.log(`[auth/callback] Creating profile for new user: ${user.email}`)

            const { error: insertError } = await supabaseAdmin.from('profiles').insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                profile_completed: false,
                last_device_reset_at: new Date().toISOString()
            })

            if (insertError) {
                console.error('[auth/callback] Profile insert error:', insertError)
                // Non-fatal: trigger might have created it
            }

            // Send welcome email (async, don't block)
            sendWelcomeEmail(user.email!).catch(console.error)

            // Redirect to complete profile - MUST copy cookies from supabaseResponse
            const redirectToProfile = NextResponse.redirect(
                `${requestUrl.origin}/completa-profilo`
            )
            // Copy all cookies that Supabase set (session tokens)
            supabaseResponse.cookies.getAll().forEach(cookie => {
                redirectToProfile.cookies.set(cookie.name, cookie.value, {
                    path: '/', // FORCE ROOT PATH
                    domain: cookie.domain,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    sameSite: cookie.sameSite as 'lax' | 'strict' | 'none' | undefined,
                    maxAge: cookie.maxAge,
                    expires: cookie.expires,
                })
            })
            return redirectToProfile
        }

        // Profile exists - check if complete
        if (!existingProfile.profile_completed) {
            console.log(`[auth/callback] Redirecting to profile completion: ${user.email}`)
            // Redirect to complete profile - MUST copy cookies from supabaseResponse
            const redirectToProfile = NextResponse.redirect(
                `${requestUrl.origin}/completa-profilo`
            )
            // Copy all cookies that Supabase set (session tokens)
            supabaseResponse.cookies.getAll().forEach(cookie => {
                redirectToProfile.cookies.set(cookie.name, cookie.value, {
                    path: '/', // FORCE ROOT PATH
                    domain: cookie.domain,
                    secure: cookie.secure,
                    httpOnly: cookie.httpOnly,
                    sameSite: cookie.sameSite as 'lax' | 'strict' | 'none' | undefined,
                    maxAge: cookie.maxAge,
                    expires: cookie.expires,
                })
            })
            return redirectToProfile
        }

        // Profile complete - redirect to home
        console.log(`[auth/callback] Login successful: ${user.email}`)
        return supabaseResponse

    } catch (err) {
        console.error('[auth/callback] Unexpected error:', err)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected`)
    }
}

/**
 * Sends welcome email to new users (non-blocking)
 */
async function sendWelcomeEmail(email: string): Promise<void> {
    try {
        const emailData = {
            service_id: 'service_i4y7ewt',
            template_id: 'template_sotc25n',
            user_id: 'NcJg5-hiu3gVJiJZ-',
            template_params: {
                from_name: 'Simon Silver Caldaie',
                to_email: email,
                subject: '🎉 Benvenuto in Simon Silver Caldaie',
                message: `
Benvenuto!

Il tuo account è stato creato con successo.
Ora puoi accedere alla piattaforma e iniziare a esplorare i corsi.

Vai al Sito:
https://simonsilvercaldaie.it/

Buon lavoro,
Simon Silver
                `.trim()
            }
        }

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        })

        if (response.ok) {
            console.log(`[auth/callback] Welcome email sent to ${email}`)
        } else {
            console.error(`[auth/callback] Welcome email failed: ${response.status}`)
        }
    } catch (err) {
        console.error('[auth/callback] Welcome email error:', err)
    }
}
