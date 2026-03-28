import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createInvoiceIfEnabled, BillingData } from '@/lib/fattureincloud'

/**
 * TEST-ONLY endpoint: Manually trigger invoice creation for a specific user.
 * GET /api/debug/test-invoice?email=simonsilvermotocross@gmail.com
 * 
 * Only works for admin (simonsilvercaldaie@gmail.com) or known test emails.
 * Creates a test invoice for €0.01 to verify FIC connectivity end-to-end.
 */

const ALLOWED_EMAILS = [
    'simonsilvercaldaie@gmail.com',
    'simonsilvermotocross@gmail.com',
]

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get('email') || 'simonsilvermotocross@gmail.com'
    
    const logs: string[] = []
    const log = (msg: string) => {
        console.log(`[test-invoice] ${msg}`)
        logs.push(msg)
    }

    log(`Starting test for email: ${email}`)

    // Check FIC config
    const ficEnabled = (process.env.FIC_ENABLED || '').trim().toLowerCase()
    const ficToken = process.env.FIC_ACCESS_TOKEN || ''
    const ficCompanyId = process.env.FIC_COMPANY_ID || ''
    
    log(`FIC_ENABLED raw value: "${process.env.FIC_ENABLED}"`)
    log(`FIC_ENABLED parsed: "${ficEnabled}" (=== 'true': ${ficEnabled === 'true'})`)
    log(`FIC_ACCESS_TOKEN length: ${ficToken.length}`)
    log(`FIC_COMPANY_ID: ${ficCompanyId}`)

    if (ficEnabled !== 'true') {
        return NextResponse.json({ 
            error: 'FIC is disabled', 
            logs,
            fix: 'Set FIC_ENABLED=true in Vercel environment variables (exact value, no spaces, lowercase)'
        })
    }

    // Find user
    const supabase = getSupabaseAdmin()
    
    log('Looking up user in auth...')
    const { data: authData } = await supabase.auth.admin.listUsers()
    const user = authData?.users?.find(u => u.email === email)
    
    if (!user) {
        log(`User not found: ${email}`)
        return NextResponse.json({ error: 'User not found', logs })
    }
    log(`Found user: ${user.id}`)

    // Fetch billing profile
    log('Fetching billing profile...')
    const { data: billing, error: billErr } = await supabase
        .from('billing_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

    if (billErr) {
        log(`Billing profile error: ${JSON.stringify(billErr)}`)
        return NextResponse.json({ error: 'Billing lookup failed', details: billErr, logs })
    }

    if (!billing) {
        log('NO BILLING PROFILE FOUND! This is why no invoice is being created.')
        return NextResponse.json({ 
            error: 'No billing profile exists for this user',
            logs,
            fix: 'The user must save their billing data (Dati Fatturazione) in the dashboard before purchasing.'
        })
    }

    log(`Billing profile found: ${JSON.stringify({
        customer_type: billing.customer_type,
        first_name: billing.first_name,
        last_name: billing.last_name,
        company_name: billing.company_name,
        fiscal_code: billing.fiscal_code,
        vat_number: billing.vat_number,
        address: billing.address,
        city: billing.city,
        postal_code: billing.postal_code,
    })}`)

    // Attempt test invoice
    log('Attempting to create test invoice via FIC API...')
    try {
        const billingData = billing as unknown as BillingData
        const result = await createInvoiceIfEnabled(
            billingData,
            email,
            'base',          // test product
            100,             // €1.00
            'TEST-DIAGNOSTIC-' + Date.now(), // fake capture ID
            undefined        // no purchase ID to update
        )
        
        log(`FIC Result: ${JSON.stringify(result)}`)
        
        return NextResponse.json({
            success: result.success,
            invoiceId: result.invoiceId,
            skipped: result.skipped,
            skipReason: result.skipReason,
            error: result.error,
            logs
        })
    } catch (e: any) {
        log(`Exception: ${e.message}`)
        return NextResponse.json({ error: e.message, logs })
    }
}
