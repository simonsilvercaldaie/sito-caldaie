import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { checkRateLimit } from '@/lib/rateLimit'

// Service Role Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
    try {
        // 1. Auth Check
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const token = authHeader.replace('Bearer ', '')

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // 2. Rate Limit (3 requests per hour per user)
        const limitRes = await checkRateLimit(`del_req_${user.id}`, 3, 3600, false)
        if (!limitRes.success) {
            return NextResponse.json({ error: 'rate_limit_exceeded', message: 'Troppe richieste. Riprova più tardi.' }, { status: 429 })
        }

        // 3. Generate Token
        // 32 bytes of random data encoded as hex
        const rawToken = crypto.randomBytes(32).toString('hex')
        // Hash for DB storage
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

        // Expiration: 15 minutes
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

        // 4. Save to DB
        const { error: dbError } = await supabaseAdmin
            .from('account_deletion_tokens')
            .insert({
                user_id: user.id,
                token_hash: tokenHash,
                expires_at: expiresAt
            })

        if (dbError) {
            console.error('Database Error:', dbError)
            return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
        }

        // 5. Send Email
        const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.simonsilvercaldaie.it'}/account/delete/confirm?token=${rawToken}`

        const emailData = {
            service_id: 'service_fwvybtr', // Keeping existing service ID
            template_id: 'template_b8p58ci', // Generic/Custom template - verifying if we need a specific one
            // Ideally we should use a specific template for deletion confirmation.
            // Using the same template structure as seen in other files for consistency.
            user_id: 'NcJg5-hiu3gVJiJZ-',
            template_params: {
                from_name: 'Simon Silver Caldaie',
                from_email: 'admin@simonsilvercaldaie.it',
                to_email: user.email,
                subject: 'CONFERMA CANCELLAZIONE ACCOUNT',
                message: `
Hai richiesto la cancellazione del tuo account su Simon Silver Caldaie.

Questa operazione è DEFINITIVA e irreversibile.
Tutti i tuoi dati, progressi e acquisti verranno rimossi permanentemente.

Se sei sicuro, clicca sul link seguente entro 15 minuti:
${confirmUrl}

Se non hai richiesto tu la cancellazione, ignora questa email e contatta l'assistenza.
                `.trim()
            }
        }

        const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        })

        if (!emailRes.ok) {
            console.error('[DELETE-ACCOUNT] EmailJS Error:', await emailRes.text())
            // Non-blocking but warning
        } else {
            console.log(`[DELETE-ACCOUNT] Email successfully sent to ${user.email}`)
        }

        return NextResponse.json({ success: true })

    } catch (e: any) {
        console.error('Delete Request Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
