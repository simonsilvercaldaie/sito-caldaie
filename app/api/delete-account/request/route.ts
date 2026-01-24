import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { checkRateLimit } from '@/lib/rateLimit'
import { sendEmail } from '@/lib/email'

// Service Role Client
// Service Role Client
// Removed top level init


export async function POST(request: NextRequest) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    try {
        // 1. Auth Check
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const token = authHeader.replace('Bearer ', '')

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // 2. Rate Limit (10 requests per hour per user) - Increased for testing
        const limitRes = await checkRateLimit(`del_req_${user.id}`, 10, 3600, false)
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

        // 5. Return confirm URL to client (client will send email via EmailJS)
        const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.simonsilvercaldaie.it'}/account/delete/confirm?token=${rawToken}`

        console.log(`[DELETE-ACCOUNT] Token created for: "${user.email}"`)

        return NextResponse.json({
            success: true,
            confirmUrl,
            email: user.email
        })

    } catch (e: any) {
        console.error('Delete Request Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
