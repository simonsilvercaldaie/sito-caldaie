import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function DELETE(request: Request) {
    try {
        // 1. Verify the current user using the standard client (via cookies/headers)
        // We need to validte that the requester IS the user they claim to be.
        // Actually, better to use the server client to get the session from cookies.

        // Since we are in an API route, we can't easily use the client-side cookie handling 
        // without @supabase/ssr or similar helpers, but we can verify the JWT if sent.
        // HOWEVER, for simplicity and security in this specific setup:
        // We will trust the Supabase Auth handling if we were using the middleware, 
        // but here we should instantiate a client to check the session.

        // Let's assume the client sends the access_token or we rely on the cookie if using createServerComponentClient logic.
        // Simplified approach: Expect the standard Supabase cookie.

        // BETTER: Use the service role to delete, but ONLY if we can verify identity.
        // To verify identity securely without the helper libs setup for App Router (which might be complex to verify here without seeing the whole setup),
        // we will ask the client to pass the user ID and we should verify the session.

        // Wait, the most robust way in Next.js App Router with Supabase is using `createServerClient` from `@supabase/ssr` or `@supabase/auth-helpers-nextjs`.
        // I see `supabaseClient.ts` uses `createClient` (client-side). 
        // I don't see a server-side helper file.

        // Alternative: The client sends the `access_token` in the Authorization header.
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')

        // Create a temporary client to verify the token
        const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const sbAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

        const tempClient = createClient(sbUrl, sbAnon)

        // Get the user from the token
        const { data: { user }, error: userError } = await tempClient.auth.getUser(token)

        if (userError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // 2. Initialize Admin Client
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'Server configuration error: Service Role Key missing' }, { status: 500 })
        }

        const adminClient = createClient(sbUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // 3. Delete related data (Foreign Keys)
        // We must delete these first because of potential foreign key constraints (RESTRICT)

        // Delete purchases
        const { error: purchasesError } = await adminClient
            .from('purchases')
            .delete()
            .eq('user_id', user.id)

        if (purchasesError) {
            console.error('Error deleting purchases:', purchasesError)
            return NextResponse.json({ error: 'Error deleting purchases: ' + purchasesError.message }, { status: 500 })
        }

        // Delete TOS acceptances
        const { error: tosError } = await adminClient
            .from('tos_acceptances')
            .delete()
            .eq('user_id', user.id)

        if (tosError) {
            console.error('Error deleting TOS:', tosError)
            return NextResponse.json({ error: 'Error deleting TOS: ' + tosError.message }, { status: 500 })
        }

        // Send goodbye email to the user BEFORE deleting the account
        try {
            const goodbyeEmailData = {
                service_id: 'service_fwvybtr',
                template_id: 'template_sotc25n', // Correct customer template
                user_id: 'NcJg5-hiu3gVJiJZ-',
                template_params: {
                    from_name: 'Simon Silver Caldaie',
                    to_email: user.email,
                    subject: '❌ Cancellazione Account - Simon Silver Caldaie',
                    message: `
Ciao.

Come da tua richiesta, ti confermiamo che il tuo account e tutti i dati associati sono stati cancellati dai nostri sistemi.

Se in futuro vorrai tornare a studiare con noi, sarai sempre il benvenuto.

Un saluto,
Simon Silver
                    `.trim()
                }
            }

            await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(goodbyeEmailData)
            })
        } catch (emailError) {
            console.error('[delete-account] Error sending goodbye email:', emailError)
        }

        // 4. Delete the user
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
