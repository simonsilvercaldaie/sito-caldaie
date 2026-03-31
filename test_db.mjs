import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_URL';
const supabaseKey = 'YOUR_KEY';

async function run() {
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: evts, error: err1 } = await supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(5);
    console.log("EVENTS:", evts, err1);
    const { data: pur, error: err2 } = await supabase.from('purchases').select('*').order('created_at', { ascending: false }).limit(2);
    console.log("PURCHASES:", pur, err2);
}
run();
