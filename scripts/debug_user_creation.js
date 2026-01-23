const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim().replace(/"/g, '');
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
    console.error("ERROR: Missing SUPABASE_SERVICE_ROLE_KEY in environment");
    process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

async function test() {
    const email = `debug_${Date.now()}@test.com`;
    console.log(`Attempting to create user: ${email}`);

    // Test 1: Minimal - No Password, No Confirm
    try {
        console.log("Test 1: Minimal...");
        const { data, error } = await admin.auth.admin.createUser({
            email: email,
        });
        if (error) throw error;
        console.log("SUCCESS Test 1. ID:", data.user.id);
        // Clean up
        await admin.auth.admin.deleteUser(data.user.id);
    } catch (e) {
        console.error("FAIL Test 1:", e);
    }

    // Test 2: With Confirm
    try {
        const email2 = `debug_cf_${Date.now()}@test.com`;
        console.log("Test 2: With Confirm...");
        const { data, error } = await admin.auth.admin.createUser({
            email: email2,
            email_confirm: true
        });
        if (error) throw error;
        console.log("SUCCESS Test 2. ID:", data.user.id);
        await admin.auth.admin.deleteUser(data.user.id);
    } catch (e) {
        console.error("FAIL Test 2:", e);
    }

    // Test 3: With Password (EXPECT FAIL if trigger active)
    try {
        const email3 = `debug_pw_${Date.now()}@test.com`;
        console.log("Test 3: With Password...");
        const { data, error } = await admin.auth.admin.createUser({
            email: email3,
            password: 'Password123!',
            email_confirm: true
        });
        if (error) throw error;
        console.log("SUCCESS Test 3 (Unexpected!). ID:", data.user.id);
        await admin.auth.admin.deleteUser(data.user.id);
    } catch (e) {
        console.error("FAIL Test 3 (Expected?):", e.message);
    }
    // Test 4: Public OTP Signup (shouldCreateUser: true)
    try {
        const email4 = `debug_otp_${Date.now()}@test.com`;
        console.log("Test 4: Public OTP Signup...");
        const anon = createClient(SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

        const { data, error } = await anon.auth.signInWithOtp({
            email: email4,
            options: { shouldCreateUser: true }
        });

        if (error) {
            console.error("FAIL Test 4:", error.message);
        } else {
            console.log("SUCCESS Test 4 (Request Sent). Data:", data);
            // Now we check if user exists in Admin
            const { data: list } = await admin.auth.admin.listUsers();
            const created = list.users.find(u => u.email === email4);
            if (created) {
                console.log("-> User CREATED in DB! ID:", created.id);
                // Can we get a session? We need the OTP.
                // In test env, we can't get the email.
                // BUT we can use admin.generateLink now that user exists?
                // If user exists, assume password is NULL.
                await admin.auth.admin.deleteUser(created.id);
            } else {
                console.log("-> User NOT found in DB (Trigger blocked?)");
            }
        }
    } catch (e) {
        console.error("FAIL Test 4 Exception:", e);
    }
}

test();
