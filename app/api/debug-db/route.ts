import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: 'Missing env vars' })

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    const events = await supabaseAdmin.from('security_events').select('*').order('created_at', { ascending: false }).limit(5)
    const purchases = await supabaseAdmin.from('purchases').select('*').order('created_at', { ascending: false }).limit(5)

    return NextResponse.json({
        events: events.data,
        purchases: purchases.data,
        envPayPal: process.env.NEXT_PUBLIC_PAYPAL_ENV,
        envPaymentsEnabled: process.env.PAYMENTS_ENABLED
    })
}
