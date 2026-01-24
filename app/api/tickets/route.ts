import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
// import { v4 as uuidv4 } from 'uuid' // Removed dependency

// Admin client for restricted operations if needed, but RLS should handle user scope.
// However, using Service Role allows us to be sure about auth context or bypass if RLS is tricky with SSR tokens.
// Standard pattern here: verify token, get user, then query.

// Helper to get admin client
function getAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase Keys')
    return createClient(supabaseUrl, supabaseKey)
}

export async function GET(request: NextRequest) {
    const supabaseAdmin = getAdminClient()

    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 })
        }

        // Fetch user tickets
        const { data: tickets, error } = await supabaseAdmin
            .from('tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ tickets })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const supabaseAdmin = getAdminClient()

    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 })
        }

        const body = await request.json()
        const { subject, initialMessage } = body

        if (!subject || !initialMessage) {
            return NextResponse.json({ error: 'Subject and message required' }, { status: 400 })
        }

        // 1. Create Ticket
        const ticketId = crypto.randomUUID()

        const { error: ticketError } = await supabaseAdmin
            .from('tickets')
            .insert({
                id: ticketId,
                user_id: user.id,
                subject: subject,
                status: 'open'
            })

        if (ticketError) throw ticketError

        // 2. Create Initial Message
        const { error: msgError } = await supabaseAdmin
            .from('ticket_messages')
            .insert({
                ticket_id: ticketId,
                sender_id: user.id, // User is sender
                message: initialMessage,
                is_admin: false
            })

        if (msgError) throw msgError

        return NextResponse.json({ success: true, ticketId })

    } catch (e: any) {
        console.error('Ticket Create Error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
