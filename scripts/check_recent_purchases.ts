import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
    const { data: purchases, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (error) {
        console.error("Error fetching purchases:", error);
    } else {
        console.log("Recent purchases:");
        console.table(purchases.map(p => ({
            id: p.id,
            user_id: p.user_id,
            product: p.product_code,
            fic_invoice: p.fic_invoice_id,
            date: p.created_at
        })));
    }
}
main();
