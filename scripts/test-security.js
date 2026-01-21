/**
 * Security Test Script
 * 
 * Esegui con: node scripts/test-security.js
 * Richiede variabili ambiente nel file .env.local o passate inline.
 */

const fs = require('fs');
const path = require('path');

// Load env (simple parser)
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val && !process.env[key]) {
            process.env[key.trim()] = val.trim();
        }
    });
} catch (e) {
    console.log('No .env.local found, assuming env vars are set.');
}

const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const TEST_TOKEN = process.env.TEST_USER_TOKEN; // Need a valid token for some tests

if (!TEST_TOKEN) {
    console.error('ERROR: TEST_USER_TOKEN env variable is required for these tests.');
    // process.exit(1); 
    console.log('SKIPPING Authenticated tests...');
}

console.log(`Target: ${API_URL}`);

async function testEndpoint(name, url, method, body, token, expectedStatus) {
    console.log(`\nTEST: ${name}`);
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}${url}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        const status = res.status;
        const data = await res.json();

        if (status === expectedStatus) {
            console.log(`✅ PASS (${status})`);
        } else {
            console.error(`❌ FAIL: Expected ${expectedStatus}, got ${status}`);
            console.error('Response:', data);
        }
        return { status, data };
    } catch (e) {
        console.error(`❌ ERROR: ${e.message}`);
    }
}

async function run() {
    // 1. Unauthenticated Access
    await testEndpoint(
        'Complete Purchase - No Token',
        '/api/complete-purchase',
        'POST',
        { orderId: 'INVALID', level: 'Base' },
        null,
        401
    );

    if (TEST_TOKEN) {
        // 2. Invalid Payload
        await testEndpoint(
            'Complete Purchase - Invalid Level',
            '/api/complete-purchase',
            'POST',
            { orderId: '1234567890AA', level: 'HackerLevel' },
            TEST_TOKEN,
            400
        );

        // 3. Rate Limit Test (Flood)
        console.log('\nTEST: Rate Limit Flood (User)');
        let denied = false;
        for (let i = 0; i < 7; i++) {
            const res = await testEndpoint(
                `Flood Request ${i + 1}`,
                '/api/complete-purchase',
                'POST',
                { orderId: '1234567890XX', level: 'Base' }, // Fake order
                TEST_TOKEN,
                (i < 5) ? 400 : 429 // Expect 429 after 5 requests (assuming orderId fail returns 400 not 402 first)
                // Note: The logic checks format then rate limit. 
                // Wait, logic in route: 
                // 1. Auth (401)
                // 2. Body parsing
                // 3. Order Regex (400)
                // 4. Rate Limit (429)
                // So if we send VALID REGEX orderId, we trigger Rate Limit check.
            );

            if (res && res.status === 429) {
                denied = true;
                break;
            }
        }
        if (denied) console.log('✅ PASS: Rate Limit Triggered');
        else console.error('❌ FAIL: Rate Limit NOT Triggered');
    }
}

run();
