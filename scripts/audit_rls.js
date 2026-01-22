const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load Env
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim().replace(/"/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTable(tableName, action = 'select') {
    process.stdout.write(`Testing [${tableName}] (${action})... `);

    let query = supabase.from(tableName).select('*', { count: 'exact', head: true });

    const { count, error } = await query;

    if (error) {
        console.log(`SECURE (Error: ${error.message})`);
        return true; // Secure
    } else {
        // If we got a result, it MIGHT be empty, but if count !== null it means we have permission to Read.
        // Wait, if RLS is enabled and no policy allows Select, it returns Empty array? Or Error?
        // It typically returns empty array (stat 200) if user has no rows, but if policy denies ALL, it should be fine.
        // BUT, if 'educational_resources' has public rows, and we see them, that's a fail.
        // For 'profiles', we shouldn't see anything.

        // Let's try to fetch one row to be sure.
        const { data } = await supabase.from(tableName).select('*').limit(1);

        if (data && data.length > 0) {
            console.log(`VULNERABLE! (Found ${count} rows, Sample: ${JSON.stringify(data[0]).substring(0, 50)}...)`);
            return false;
        } else {
            console.log(`POTENTIALLY SECURE (0 rows visible, but access allowed?) - Count: ${count}`);
            // If count is 0, it might be RLS filtering.
            return true;
        }
    }
}

async function runAudit() {
    console.log("=== SUPABASE RLS AUDIT (ANONYMOUS ROLE) ===");
    console.log("Target: " + supabaseUrl);

    const tables = [
        'profiles',
        'billing_profiles',
        'active_sessions',
        'trusted_devices',
        'purchases',
        'licenses', // May not exist
        'team_licenses',
        'team_members',
        'educational_resources',
        'user_progress' // May not exist
    ];

    let vulnerabilities = 0;

    for (const table of tables) {
        const secure = await testTable(table);
        if (!secure) vulnerabilities++;
    }

    console.log("------------------------------------------------");
    if (vulnerabilities > 0) {
        console.log(`FAILURE: Found ${vulnerabilities} vulnerable tables.`);
    } else {
        console.log("SUCCESS: No public data leaks found (Anonymous).");
    }
}

runAudit();
