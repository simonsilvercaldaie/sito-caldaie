const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envPath = 'c:\\\\Users\\\\simon\\\\simon silver caldaie\\\\sito\\\\.env.local';
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    // Solo le righe valide
    if (line.includes('=')) {
        const firstEq = line.indexOf('=');
        const key = line.substring(0, firstEq).trim();
        const val = line.substring(firstEq + 1).trim().replace(/^"|"$/g, '');
        env[key] = val;
    }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
	console.error('Missing URL or KEY');
	process.exit(1);
}

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
