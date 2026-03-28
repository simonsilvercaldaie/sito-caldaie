import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
    console.log("Looking up purchases for simonsilvermotocross@gmail.com");
    
    // First find the user
    const { data: users, error: err1 } = await supabase.auth.admin.listUsers();
    const user = users?.users.find(u => u.email === 'simonsilvermotocross@gmail.com');
    
    if (user) {
        console.log(`Found user ID: ${user.id}`);
        // Now find purchases
        const { data: purchases, error } = await supabase
            .from('purchases')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("Error fetching purchases:", error);
        } else {
            console.log(`Found ${purchases?.length || 0} purchases:`);
            purchases?.forEach(p => {
                console.log(`- Purchase ID: ${p.id}`);
                console.log(`  Code: ${p.product_code}`);
                console.log(`  FIC Invoice ID: ${p.fic_invoice_id}`);
                console.log(`  Created: ${p.created_at}`);
                console.log(`  Amount: ${p.amount_cents}`);
            });
        }
    } else {
        console.log("User not found!");
    }
}
main();
