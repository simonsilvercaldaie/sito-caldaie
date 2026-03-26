
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
    const targetUser = users.users.find(u => u.email === 'simonsilvercaldaie@gmail.com');
    if (!targetUser) { console.log('User not found'); process.exit(1); }

    const { error: insertErr } = await supabase.from('purchases').upsert({
        user_id: targetUser.id,
        user_email: targetUser.email,
        product_code: 'COMPLETE',
        amount_cents: 0,
        currency: 'EUR',
        paypal_order_id: 'ADMIN_GRANT_TEST_' + Date.now(),
        paypal_capture_id: 'ADMIN_GRANT_TEST_' + Date.now(),
        plan_type: 'individual'
    }, { onConflict: 'paypal_order_id' });

    if (insertErr) { console.error('Error:', insertErr); }
    else { console.log('SUCCESS: Granted COMPLETE access to simonsilvercaldaie@gmail.com'); }
}
run();
