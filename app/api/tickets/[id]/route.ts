
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

// Allowed Admins
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'simonsilvercaldaie@gmail.com').split(',').map(e => e.trim())

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 })
        }

        const isAdmin = ADMIN_EMAILS.includes(user.email || '')

        // 1. Check access
        const { data: ticket } = await supabaseAdmin
            .from('tickets')
            .select('*')
            .eq('id', id)
            .single()

        if (!ticket) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

        // Only owner or admin
        if (!isAdmin && ticket.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 2. Fetch messages
        const { data: messages } = await supabaseAdmin
            .from('ticket_messages')
            .select(`
                *,
                sender:sender_id (email)
            `)
            .eq('ticket_id', id)
            .order('created_at', { ascending: true })

        return NextResponse.json({ ticket, messages })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 })
        }

        const isAdmin = ADMIN_EMAILS.includes(user.email || '')
        const body = await request.json()
        const { message } = body

        if (!message) return NextResponse.json({ error: 'Message empty' }, { status: 400 })

        // 1. Verify Ticket Access
        const { data: ticket } = await supabaseAdmin
            .from('tickets')
            .select('user_id')
            .eq('id', id)
            .single()

        if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

        if (!isAdmin && ticket.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 2. Insert Message
        const { error: msgErr } = await supabaseAdmin
            .from('ticket_messages')
            .insert({
                ticket_id: id,
                sender_id: user.id,
                message: message,
                is_admin: isAdmin
            })

        if (msgErr) throw msgErr

        // 3. Update Ticket Timestamp & Status
        const newStatus = isAdmin ? 'replied_admin' : 'replied_user'
        await supabaseAdmin
            .from('tickets')
            .update({
                updated_at: new Date().toISOString(),
                status: newStatus
            })
            .eq('id', id)

        return NextResponse.json({ success: true })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) return NextResponse.json({ error: 'Invalid Token' }, { status: 401 })

        const isAdmin = ADMIN_EMAILS.includes(user.email || '')
        if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const body = await request.json()
        const { status } = body

        if (status !== 'closed') return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

        await supabaseAdmin
            .from('tickets')
            .update({ status: 'closed', updated_at: new Date().toISOString() })
            .eq('id', id)

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
