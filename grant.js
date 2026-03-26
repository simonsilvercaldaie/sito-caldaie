
const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = content.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m);
const keyMatch = content.match(/^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m);
const url = urlMatch ? urlMatch[1].replace(/["'']/g, '').trim() : null;
const key = keyMatch ? keyMatch[1].replace(/["'']/g, '').trim() : null;

if (!url || !key) { console.error('Key non trovate'); process.exit(1); }

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function run() {
    const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
    if (userErr) { console.error('Error fetching users:', userErr); return; }
    
    const targetUser = users.users.find(u => u.email === 'simonsilvercaldaie@gmail.com');
    if (!targetUser) { console.log('User not found'); return; }

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

    if (insertErr) { console.error('Error granting access:', insertErr); }
    else { console.log('SUCCESS: Granted COMPLETE access to simonsilvercaldaie@gmail.com'); }
}
run();
