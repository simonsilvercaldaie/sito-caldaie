import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const [webhooksRes, purchasesRes] = await Promise.all([
        supabase.from('webhook_events').select('payload, error_details, created_at, status').order('created_at', { ascending: false }).limit(3),
        supabase.from('purchases').select('id, amount_cents, fic_invoice_id, created_at').order('created_at', { ascending: false }).limit(3)
    ])

    return NextResponse.json({
        config: {
            FIC_ENABLED: process.env.FIC_ENABLED,
            FIC_COMPANY_ID: process.env.FIC_COMPANY_ID,
            FIC_VAT_RATE: process.env.FIC_VAT_RATE,
            HAS_TOKEN: !!process.env.FIC_ACCESS_TOKEN
        },
        purchases: purchasesRes.data,
        webhooks: webhooksRes.data
    })
}
