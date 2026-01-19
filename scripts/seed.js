const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Load Env Vars manually (Simple parser)
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim().replace(/"/g, ''); // Simple cleanup
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

if (!env.SUPABASE_SERVICE_ROLE_KEY && !process.argv.includes('--dry-run')) {
    console.warn("WARNING: Service Role Key missing. Writes may fail.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BASE_PATH = 'c:\\Users\\simon\\simon silver caldaie\\materiali_didattici';
const DRY_RUN = process.argv.includes('--dry-run');

console.log(`Starting Seeding (Dry Run: ${DRY_RUN})...`);
console.log(`Target: ${BASE_PATH}`);

// Helper: Recursive Walk
function getAllFiles(dirPath, arrayOfFiles) {
    arrayOfFiles = arrayOfFiles || [];
    try {
        const files = fs.readdirSync(dirPath);
        files.forEach(function (file) {
            if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            } else {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        });
    } catch (e) {
        // Ignora errori di accesso cartelle
    }
    return arrayOfFiles;
}

// Main Logic
async function seed() {
    const files = getAllFiles(BASE_PATH);
    let found = 0;
    let inserted = 0;
    let errors = [];

    for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filename = path.basename(file);
        // Matches:
        // scheda_01.json, checklist_14.json, quiz_27.json
        // caso-studio-01.json
        let match = filename.match(/^(scheda|checklist|quiz|caso-studio)[_-](\d+)\.json$/);

        if (!match) {
            // Try alternate pattern if any
            continue;
        }

        const [_, typeRaw, videoId] = match;

        // Check if it's the "formati_standard" file or other junk
        if (filename.includes('formati_standard')) continue;

        found++;
        const assetType = typeRaw.replace('-', '_'); // caso-studio -> caso_studio

        // Level Logic
        // 01-09 Base
        // 10-18 Intermediate
        // 19-27 Advanced
        const vid = parseInt(videoId, 10);
        let level = 'base';
        if (vid >= 10 && vid <= 18) level = 'intermedio';
        if (vid >= 19) level = 'avanzato';

        console.log(`[FOUND] ${filename} -> ID:${videoId} Type:${assetType} Level:${level}`);

        const contentRaw = fs.readFileSync(file, 'utf-8');
        let contentJson;
        try {
            contentJson = JSON.parse(contentRaw);
        } catch (e) {
            console.error(`[ERROR] JSON Parse ${filename}`);
            errors.push(filename);
            continue;
        }

        if (!DRY_RUN) {
            const { error } = await supabase
                .from('educational_resources')
                .upsert({
                    video_id: videoId,
                    type: assetType,
                    level: level,
                    title: contentJson.meta?.title || `${assetType} Video ${videoId}`,
                    content: contentJson,
                    version: 1,
                    is_active: true
                }, { onConflict: 'video_id, type' });

            if (error) {
                console.error(`[DB ERROR] ${filename}: ${error.message}`);
                errors.push(filename);
            } else {
                inserted++;
            }
        }
    }

    console.log("--- REPORT ---");
    console.log(`Files Found: ${found}`);
    if (!DRY_RUN) console.log(`Records Upserted: ${inserted}`);
    if (errors.length > 0) {
        console.log("Errors:", errors);
    }
}

seed();
