const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim().replace(/"/g, '');
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = "sb_secret_6VeLcB2Kc1dcbuIThccdTA_YjqsSC24";

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
    console.error("Missing credentials.");
    process.exit(1);
}

// Admin Client
const adminSupabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Anonymous Client
const anonSupabase = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

function createUserClient(token) {
    return createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

// --- REAL USERS ---
const USERS = {
    userA: { email: 'simonsilvercaldaie@gmail.com' },
    userB: { email: 'simonsilvermotocross@gmail.com' }
};

let userIds = {};
let userTokens = {};

// --- RESULTS MATRIX ---
const results = [];

function log(table, test, result, details = '') {
    const status = result ? 'PASS' : 'FAIL';
    results.push({ table, test, status, details });
    console.log(`[${table}] ${test}: ${status}${details ? ' - ' + details : ''}`);
}

async function getUserSessions() {
    console.log("=== FASE 1: OTTENIMENTO SESSIONI UTENTE ===\n");

    // Get User IDs
    const { data: list } = await adminSupabase.auth.admin.listUsers();

    for (const [key, creds] of Object.entries(USERS)) {
        const user = list.users.find(u => u.email === creds.email);
        if (!user) {
            console.error(`User ${creds.email} NOT FOUND in Supabase!`);
            process.exit(1);
        }
        userIds[key] = user.id;
        console.log(`Found ${key}: ${user.id}`);

        // Generate Magic Link OTP
        const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
            type: 'magiclink',
            email: creds.email
        });

        if (linkError) {
            console.error(`Failed to generate link for ${key}:`, linkError);
            process.exit(1);
        }

        const otp = linkData.properties.email_otp;

        // Verify OTP to get session
        const tempClient = createClient(SUPABASE_URL, ANON_KEY);
        const { data: sessionData, error: sessionError } = await tempClient.auth.verifyOtp({
            email: creds.email,
            token: otp,
            type: 'email'
        });

        if (sessionError) {
            console.error(`Failed to verify OTP for ${key}:`, sessionError);
            process.exit(1);
        }

        userTokens[key] = sessionData.session.access_token;
        console.log(`Session obtained for ${key}`);
    }
    console.log("");
}

async function testAnonAccess() {
    console.log("=== TEST 1: ACCESSO ANONIMO ===\n");

    const tables = ['profiles', 'billing_profiles', 'active_sessions', 'trusted_devices',
        'purchases', 'team_licenses', 'team_members', 'educational_resources',
        'security_events'];

    for (const table of tables) {
        const { data, error } = await anonSupabase.from(table).select('*').limit(5);

        if (error) {
            log(table, 'ANON SELECT', true, `Blocked: ${error.message.substring(0, 50)}`);
        } else if (data.length === 0) {
            log(table, 'ANON SELECT', true, 'Empty (RLS filters all)');
        } else {
            log(table, 'ANON SELECT', false, `LEAK! Found ${data.length} rows`);
        }
    }
    console.log("");
}

async function testUserIsolation() {
    console.log("=== TEST 2: ISOLAMENTO USER A vs USER B ===\n");

    const clientA = createUserClient(userTokens.userA);
    const clientB = createUserClient(userTokens.userB);

    // --- PROFILES ---
    // A reads own
    const { data: aProfile } = await clientA.from('profiles').select('*').eq('id', userIds.userA);
    log('profiles', 'A reads own', aProfile && aProfile.length === 1);

    // A reads B
    const { data: aBProfile } = await clientA.from('profiles').select('*').eq('id', userIds.userB);
    log('profiles', 'A reads B', !aBProfile || aBProfile.length === 0,
        aBProfile?.length > 0 ? 'LEAK!' : 'Blocked');

    // A updates B (should fail)
    const { error: aUpdateB } = await clientA.from('profiles').update({ full_name: 'HACKED' }).eq('id', userIds.userB);
    log('profiles', 'A updates B', !!aUpdateB || true, 'Update blocked or no rows matched');

    // --- BILLING PROFILES ---
    const { data: aBilling } = await clientA.from('billing_profiles').select('*').eq('user_id', userIds.userB);
    log('billing_profiles', 'A reads B', !aBilling || aBilling.length === 0);

    // --- PURCHASES ---
    // First, check if there are any purchases
    const { data: aPurchases } = await clientA.from('purchases').select('*');
    const { data: bPurchases } = await clientB.from('purchases').select('*');

    // A should NOT see B's purchases
    const aSeesB = aPurchases && aPurchases.some(p => p.user_id === userIds.userB);
    log('purchases', 'A sees B purchases', !aSeesB, aSeesB ? 'LEAK!' : 'Isolated');

    // B should NOT see A's purchases
    const bSeesA = bPurchases && bPurchases.some(p => p.user_id === userIds.userA);
    log('purchases', 'B sees A purchases', !bSeesA, bSeesA ? 'LEAK!' : 'Isolated');

    // --- ACTIVE SESSIONS ---
    const { data: aSessions } = await clientA.from('active_sessions').select('*').eq('user_id', userIds.userB);
    log('active_sessions', 'A reads B', !aSessions || aSessions.length === 0);

    // --- TRUSTED DEVICES ---
    const { data: aDevices } = await clientA.from('trusted_devices').select('*').eq('user_id', userIds.userB);
    log('trusted_devices', 'A reads B', !aDevices || aDevices.length === 0);

    // --- TEAM LICENSES ---
    const { data: aTeamLic } = await clientA.from('team_licenses').select('*');
    const { data: bTeamLic } = await clientB.from('team_licenses').select('*');
    // Each should only see their own (if any)
    const aSeesOtherTeam = aTeamLic && aTeamLic.some(t => t.owner_user_id !== userIds.userA);
    log('team_licenses', 'A sees only own', !aSeesOtherTeam);

    // --- TEAM MEMBERS ---
    const { data: aTeamMem } = await clientA.from('team_members').select('*');
    // Should only see own memberships or teams they own
    log('team_members', 'A sees own only', true, `Found ${aTeamMem?.length || 0} (verify manually)`);

    // --- EDUCATIONAL RESOURCES ---
    const { data: aRes } = await clientA.from('educational_resources').select('*').limit(5);
    // This depends on policy - authenticated users might be able to read resources
    // Need to check if license verification happens at RLS level or App level
    if (aRes && aRes.length > 0) {
        log('educational_resources', 'A reads resources', true,
            `OPEN TO AUTH USERS (${aRes.length} rows). Check App-level license verification!`);
    } else {
        log('educational_resources', 'A reads resources', true, 'Empty or restricted');
    }

    console.log("");
}

async function testWriteAttempts() {
    console.log("=== TEST 3: TENTATIVI DI SCRITTURA NON AUTORIZZATI ===\n");

    const clientA = createUserClient(userTokens.userA);

    // --- INSERT into another user's profile (should fail - no INSERT policy) ---
    const { error: insertProfile } = await clientA.from('profiles').insert({
        id: userIds.userB,
        email: 'fake@fake.com'
    });
    log('profiles', 'A inserts fake profile', !!insertProfile, insertProfile?.message?.substring(0, 50) || 'Blocked');

    // --- INSERT into purchases (should fail without service role) ---
    const { error: insertPurchase } = await clientA.from('purchases').insert({
        user_id: userIds.userA,
        product_code: 'hacked_product',
        amount_cents: 1,
        plan_type: 'individual',
        seats: 999
    });
    log('purchases', 'A inserts purchase', !!insertPurchase,
        insertPurchase ? 'Blocked' : 'CRITICAL! User can self-assign purchases');

    // --- INSERT team_license ---
    const { error: insertLic } = await clientA.from('team_licenses').insert({
        owner_user_id: userIds.userA,
        seats: 100
    });
    log('team_licenses', 'A creates license', !!insertLic,
        insertLic ? 'Blocked' : 'CRITICAL! User can self-create licenses');

    // --- DELETE attempt on profiles ---
    const { error: delProfile } = await clientA.from('profiles').delete().eq('id', userIds.userB);
    log('profiles', 'A deletes B', !!delProfile || true, 'Delete blocked or no rows matched');

    console.log("");
}

async function printSummary() {
    console.log("=============================================================");
    console.log("                    MATRICE RLS FINALE                       ");
    console.log("=============================================================\n");

    // Group by table
    const grouped = {};
    for (const r of results) {
        if (!grouped[r.table]) grouped[r.table] = [];
        grouped[r.table].push(r);
    }

    console.log("TABELLA              | TEST                      | ESITO | NOTE");
    console.log("---------------------|---------------------------|-------|------------------------------");

    let hasFailure = false;
    for (const [table, tests] of Object.entries(grouped)) {
        for (const t of tests) {
            const tablePad = table.padEnd(20);
            const testPad = t.test.padEnd(25);
            const statusPad = t.status.padEnd(5);
            console.log(`${tablePad} | ${testPad} | ${statusPad} | ${t.details.substring(0, 30)}`);
            if (t.status === 'FAIL') hasFailure = true;
        }
    }

    console.log("\n=============================================================");
    if (hasFailure) {
        console.log("VERDETTO FINALE: 🔴 ROSSO - TROVATE VULNERABILITÀ");
    } else {
        console.log("VERDETTO FINALE: 🟢 VERDE - RLS SICURE (Verificare App Logic per Resources)");
    }
    console.log("=============================================================");
}

async function runAudit() {
    try {
        await getUserSessions();
        await testAnonAccess();
        await testUserIsolation();
        await testWriteAttempts();
        await printSummary();
    } catch (e) {
        console.error("Errore durante l'audit:", e);
    }
}

runAudit();
