import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log("--- LATEST SECURITY EVENTS ---");
    const { data: events, error: err1 } = await supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(5);
    if (err1) console.error(err1);
    else console.log(events);

    console.log("\n--- LATEST PURCHASES ---");
    const { data: purchases, error: err2 } = await supabase.from('purchases').select('*').order('created_at', { ascending: false }).limit(2);
    if (err2) console.error(err2);
    else console.log(purchases);
}

check();
