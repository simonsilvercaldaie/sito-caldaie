import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Service Role Client
// The global supabaseAdmin initialization is removed as per the instruction.

export async function POST(request: NextRequest) {
    // Initialize supabaseAdmin inside the POST handler
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    try {
        const body = await request.json()
        const { token } = body

        if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

        // 1. Hash Token
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

        // 2. Lookup Valid Token
        const { data: tokenData, error: tokenErr } = await supabaseAdmin
            .from('account_deletion_tokens')
            .select('*')
            .eq('token_hash', tokenHash)
            .is('used_at', null)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (tokenErr || !tokenData) {
            return NextResponse.json({ error: 'Token non valido o scaduto' }, { status: 400 })
        }

        const userId = tokenData.user_id

        // 3. Mark Token Used (Idempotency)
        await supabaseAdmin
            .from('account_deletion_tokens')
            .update({ used_at: new Date().toISOString() })
            .eq('id', tokenData.id)

        // 4. Perform Deletion
        // Delete dependent data first
        await supabaseAdmin.from('purchases').delete().eq('user_id', userId)
        await supabaseAdmin.from('tos_acceptances').delete().eq('user_id', userId)
        await supabaseAdmin.from('billing_profiles').delete().eq('user_id', userId)
        await supabaseAdmin.from('active_sessions').delete().eq('user_id', userId)
        await supabaseAdmin.from('trusted_devices').delete().eq('user_id', userId)
        await supabaseAdmin.from('security_events').delete().eq('user_id', userId)
        await supabaseAdmin.from('profiles').delete().eq('id', userId) // often cascades but safe to be explicit

        // Finally delete the Auth User
        const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (delErr) {
            console.error('Auth Deletion Error:', delErr)
            return NextResponse.json({ error: 'Failed to delete auth user' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (e: any) {
        console.error('Delete Confirm Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
