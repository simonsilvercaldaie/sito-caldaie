import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`)
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, {
                                ...options,
                                httpOnly: false, // Allow client side to read the cookie
                            })
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
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

        // Detect if this is a FIRST-TIME signup by checking created_at timestamp.
        // We can't rely on "profile doesn't exist" because the DB trigger 
        // (handle_new_user) creates the profile before this callback runs.
        const createdAt = new Date(user.created_at).getTime()
        const isNewUser = (Date.now() - createdAt) < 60000 // Created less than 60 seconds ago

        if (isNewUser) {
            console.log(`[auth/callback] New user detected: ${user.email}`)

            // Ensure profile exists (trigger should have created it, but just in case)
            const { error: insertError } = await supabaseAdmin.from('profiles').upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                profile_completed: false
            }, { onConflict: 'id', ignoreDuplicates: true })

            if (insertError) {
                console.error('[auth/callback] Profile upsert error:', insertError)
            }

            // Send welcome email (async, don't block)
            sendWelcomeEmail(user.email!).catch(console.error)
        }

        // All users go to home - profile completion is now required before purchase, not at login
        console.log(`[auth/callback] Login successful: ${user.email}`)
        return NextResponse.redirect(`${requestUrl.origin}/`)

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
