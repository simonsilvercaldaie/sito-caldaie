import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createInvoiceIfEnabled, BillingData } from '@/lib/fattureincloud'

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the latest purchase
    const { data: purchaseRow } = await supabaseAdmin
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    
    if (!purchaseRow) return NextResponse.json({ error: 'No purchase found' });

    // Get the billing profile for this user
    const { data: billing } = await supabaseAdmin
        .from('billing_profiles')
        .select('*')
        .eq('user_id', purchaseRow.user_id)
        .single();
    
    if (!billing) return NextResponse.json({ error: 'No billing profile found', user_id: purchaseRow.user_id });

    // Get the user's email
    const { data: userRecord } = await supabaseAdmin.auth.admin.getUserById(purchaseRow.user_id);
    const userEmail = userRecord?.user?.email || 'unknown@example.com';

    // Call FIC directly and capture the response
    const billingForFic = billing as unknown as BillingData;
    
    let result;
    try {
        result = await createInvoiceIfEnabled(
            billingForFic,
            userEmail,
            purchaseRow.product_code,
            purchaseRow.amount_cents,
            purchaseRow.paypal_capture_id || `MANUAL-${purchaseRow.id}`,
            purchaseRow.id
        );
    } catch (e: any) {
        result = { error_exception: e.message, stack: e.stack };
    }

    return NextResponse.json({
        purchase: purchaseRow,
        billing: billingForFic,
        fic_result: result
    })
}
