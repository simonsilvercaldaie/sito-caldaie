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
// User provided key
// User provided key - REPLACED WITH ENV VAR
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
    console.error("Missing credentials.");
    process.exit(1);
}

// Admin Client
const adminSupabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

function createUserClient(token) {
    return createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

// --- TEST DATA ---
// NO PASSWORDS - Trigger 'verify_google_only' blocks them.
const TEST_USERS = {
    userA: { email: 'sec_test_user_a@simonsilver.it', role: 'user' },
    userB: { email: 'sec_test_user_b@simonsilver.it', role: 'user' },
    teamOwner: { email: 'sec_test_owner@simonsilver.it', role: 'owner' },
    teamMember: { email: 'sec_test_member@simonsilver.it', role: 'member' }
};

let userTokens = {};
let userIds = {};

async function setupUsers() {
    process.stdout.write("Creating Test Users & Sessions... ");
    for (const [key, creds] of Object.entries(TEST_USERS)) {
        // 1. Delete if exists
        const { data: list } = await adminSupabase.auth.admin.listUsers();
        // Since listUsers is paginated, we might miss it if many users exist, but for test env likely fine.
        // Better: delete by email if found? No, deleteUser needs ID.
        // We iterate list to find email.
        const existing = list.users.find(u => u.email === creds.email);
        if (existing) {
            await adminSupabase.auth.admin.deleteUser(existing.id);
        }

        // 2. Create (No Password)
        const { data, error } = await adminSupabase.auth.admin.createUser({
            email: creds.email,
            email_confirm: true,
            user_metadata: { full_name: `Test ${key}` }
        });

        if (error) {
            console.error(`Failed to create ${key}:`, error);
            process.exit(1);
        }

        userIds[key] = data.user.id;

        // 3. Generate Magic Link
        const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
            type: 'magiclink',
            email: creds.email
        });

        if (linkError) {
            console.error(`Failed to generate link for ${key}:`, linkError);
            process.exit(1);
        }

        // 4. Verify OTP (using 'email_otp' from link properties) to get Session
        const otp = linkData.properties.email_otp;

        // We use a temporary anon client to exchange OTP for session
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
    }
    console.log("Done.");
}

async function cleanup() {
    process.stdout.write("Cleaning up... ");
    for (const id of Object.values(userIds)) {
        if (id) await adminSupabase.auth.admin.deleteUser(id);
    }
    // Also remove test purchases/data if possible, but they are linked to users so cascade delete should handle it.
    // Except 'educational_resources' if we insert any? We inserted strictly coupled data?
    // We inserted purchases coupled to user_id. Cascade should work.
    console.log("Done.");
}

async function runTests() {
    try {
        await setupUsers();
    } catch (e) {
        console.error("Setup failed:", e);
        await cleanup();
        return;
    }

    const clientA = createUserClient(userTokens.userA);
    // const clientB = createUserClient(userTokens.userB); // Unused currently
    // const clientOwner = createUserClient(userTokens.teamOwner); // Unused currently
    // const clientMember = createUserClient(userTokens.teamMember); // Unused currently

    // --- SCENARIO 1: PROFILES ---
    console.log("\n--- TEST: PROFILES ---");
    // A reads A
    const { data: myProfile } = await clientA.from('profiles').select('*').eq('id', userIds.userA).single();
    const aReadsA = !!myProfile;
    // A reads B
    const { data: otherProfile } = await clientA.from('profiles').select('*').eq('id', userIds.userB);
    const aReadsB = otherProfile && otherProfile.length > 0;

    console.log(`[UserId: ${userIds.userA}]`);
    console.log(`User A reads Own Profile: ${aReadsA ? 'PASS' : 'FAIL'}`);
    console.log(`User A reads User B Profile: ${!aReadsB ? 'PASS' : 'FAIL (Data Leak! Found: ' + otherProfile?.length + ')'}`);


    // --- SCENARIO 2: PURCHASES ---
    console.log("\n--- TEST: PURCHASES ---");
    // Insert purchase for A & B using Admin
    const { error: pErrorA } = await adminSupabase.from('purchases').insert({
        user_id: userIds.userA,
        product_code: 'test_prod_A',
        amount_cents: 1000,
        plan_type: 'individual',
        seats: 1,
        paypal_capture_id: 'test_cap_A_' + Date.now()
    });
    if (pErrorA) console.error("Setup Error Purchase A:", pErrorA);

    const { error: pErrorB } = await adminSupabase.from('purchases').insert({
        user_id: userIds.userB,
        product_code: 'test_prod_B',
        amount_cents: 1000,
        plan_type: 'individual',
        seats: 1,
        paypal_capture_id: 'test_cap_B_' + Date.now()
    });
    if (pErrorB) console.error("Setup Error Purchase B:", pErrorB);

    // A reads A purchase
    const { data: myPurch } = await clientA.from('purchases').select('*'); // Select all visible
    const aReadsAPurch = myPurch && myPurch.some(p => p.paypal_capture_id.includes('test_cap_A'));

    // A reads B purchase
    const canSeeOthers = myPurch && myPurch.some(p => p.user_id === userIds.userB);

    console.log(`User A reads Own Purchase: ${aReadsAPurch ? 'PASS' : 'FAIL'}`);
    console.log(`User A reads Others Purchase: ${!canSeeOthers ? 'PASS' : 'FAIL (Leak!)'}`);

    // --- SCENARIO 3: EDUCATIONAL RESOURCES ---
    console.log("\n--- TEST: EDUCATIONAL_RESOURCES ---");
    // Check if table exists/readable
    // Try to read ALL resources
    const { data: resData, error: resError } = await clientA.from('educational_resources').select('*').limit(5);

    if (resError) {
        console.log(`User A read Resources: ERROR/SECURE? (${resError.message})`);
    } else {
        const count = resData.length;
        console.log(`User A read Resources: ${count > 0 ? 'OPEN (Requires App Logic Check)' : 'EMPTY/RESTRICTED'}`);
        if (count > 0) {
            console.log("  -> NOTE: Resources are readable by authenticated users via API. Ensure App Logic verifies purchases.");
        }
    }

    // --- SCENARIO 4: TEAM ISOLATION ---
    console.log("\n--- TEST: TEAM ISOLATION ---");
    // Setup Team License for Owner
    const { data: licData, error: licError } = await adminSupabase.from('team_licenses').insert({
        owner_user_id: userIds.teamOwner,
        seats: 5,
        company_name: 'Test Corp'
    }).select().single();

    if (licError) {
        console.error("Setup Error Team License:", licError);
    } else {
        const licenseId = licData.id;

        // Add Member
        await adminSupabase.from('team_members').insert({
            team_license_id: licenseId,
            user_id: userIds.teamMember
        });

        // 1. Member reads License?
        const clientMem = createUserClient(userTokens.teamMember);
        const { data: memLic } = await clientMem.from('team_licenses').select('*').eq('id', licenseId);
        const memberCanReadLicense = memLic && memLic.length > 0;
        console.log(`Team Member reads License Details: ${!memberCanReadLicense ? 'PASS' : 'FAIL (Member sees license info)'}`);
        // Note: It might be acceptable for member to see license info (e.g. "SimonsIlver Team").
        // But if they see "owner_user_id", that's metadata. 
        // Policy "Members can view own membership" exists on team_members.
        // Policy on team_licenses? "Owners can view own licenses". NO member policy seen in snippets.
        // So DEFAULT is DENY.

        // 2. Member reads Owner Profiles?
        const { data: ownProf } = await clientMem.from('profiles').select('*').eq('id', userIds.teamOwner);
        const memberCanReadOwner = ownProf && ownProf.length > 0;
        console.log(`Team Member reads Owner Profile: ${!memberCanReadOwner ? 'PASS' : 'FAIL'}`);
    }

    await cleanup();
}

runTests().catch(async (err) => {
    console.error("Runtime Error:", err);
    await cleanup();
});
