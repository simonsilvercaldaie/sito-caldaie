import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { createInvoiceIfEnabled, BillingData } from '../lib/fattureincloud';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function replayLastPurchase() {
    console.log("Fetching last purchase...");
    const { data: purchase, error } = await supabase
        .from('purchases')
        .select(`
            *,
            billing_profiles (*)
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !purchase) {
        console.error("Error fetching purchase", error);
        return;
    }

    // Force clear fic_invoice_id from DB so it tries again
    if (purchase.fic_invoice_id) {
        console.log("Clearing existing invoice ID", purchase.fic_invoice_id);
        await supabase.from('purchases').update({ fic_invoice_id: null }).eq('id', purchase.id);
    }
    
    // Also change the capture_id so FIC doesn't complain about duplicate
    const newCaptureId = purchase.paypal_capture_id + '-retry3';

    console.log("Replaying invoice for purchase:", purchase.id);
    console.log("Billing profile:", purchase.billing_profiles);

    const billingData: BillingData = {
        customer_type: purchase.billing_profiles.customer_type,
        first_name: purchase.billing_profiles.first_name,
        last_name: purchase.billing_profiles.last_name,
        company_name: purchase.billing_profiles.company_name,
        vat_number: purchase.billing_profiles.vat_number,
        sdi_code: purchase.billing_profiles.sdi_code,
        fiscal_code: purchase.billing_profiles.fiscal_code,
        address: purchase.billing_profiles.address,
        city: purchase.billing_profiles.city,
        postal_code: purchase.billing_profiles.postal_code,
    };

    const res = await createInvoiceIfEnabled(
        billingData,
        purchase.user_email,
        purchase.product_id,
        purchase.amount_cents,
        newCaptureId,
        purchase.id
    );

    console.log("Result:", res);
}

replayLastPurchase();
