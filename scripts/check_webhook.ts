import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function check() {
    const { data, error } = await supabase.from('purchases').select('id, product_code, amount_cents, fic_invoice_id, created_at').order('created_at', { ascending: false }).limit(3);
    console.log("Purchases:", data);
}
check();
