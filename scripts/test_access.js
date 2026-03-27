const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    const key = parts[0];
    const val = parts.slice(1).join('=');
    if (key && val) env[key.trim()] = val.trim().replace(/"/g, '');
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) return console.error(userError);
  
  const user = users.users.find(u => u.email === 'dani.bighelli@gmail.com');
  if (!user) {
    console.log('User dani.bighelli@gmail.com not found');
    return;
  }
  
  console.log('User found! ID:', user.id);
  
  const { data: purchases } = await supabase.from('purchases').select('*').eq('user_id', user.id);
  const { data: access } = await supabase.from('user_access').select('*').eq('user_id', user.id);
  
  console.log('--- PURCHASES ---');
  console.log(purchases);
  
  console.log('--- USER ACCESS ---');
  console.log(access);
}

run();
