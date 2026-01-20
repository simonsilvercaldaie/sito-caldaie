import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const supabase = createClient(supabaseUrl, supabaseKey)

        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && user && user.email) {
            // Send Welcome Email
            try {
                const emailData = {
                    service_id: 'service_i4y7ewt',
                    template_id: 'template_sotc25n',
                    user_id: 'NcJg5-hiu3gVJiJZ-',
                    template_params: {
                        from_name: 'Simon Silver Caldaie',
                        to_email: user.email,
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

                await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(emailData)
                })

                console.log(`[auth/callback] Welcome email sent to ${user.email}`)
            } catch (err) {
                console.error('[auth/callback] Failed to send welcome email:', err)
            }
        }
    }

    // Redirect to home after confirmation
    return NextResponse.redirect(`${requestUrl.origin}/`)
}
