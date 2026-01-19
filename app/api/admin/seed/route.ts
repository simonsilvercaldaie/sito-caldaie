import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Initialize Supabase Client (Service Role for Admin Writes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must start with 'no'
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BASE_PATH = 'c:\\Users\\simon\\simon silver caldaie\\materiali_didattici';

type SeedingReport = {
    found: number;
    inserted: number;
    errors: string[];
    details: any[];
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const execute = searchParams.get('execute') === 'true';

    const report: SeedingReport = {
        found: 0,
        inserted: 0,
        errors: [],
        details: [],
    };

    try {
        // 1. Recursive Scan
        const files = getAllFiles(BASE_PATH);

        for (const file of files) {
            if (!file.endsWith('.json')) continue;

            const filename = path.basename(file);
            // Valid patterns: scheda_XX.json, checklist_XX.json, quiz_XX.json, caso-studio-XX.json
            // Regex to capture TYPE and ID
            // Types: scheda, checklist, quiz, caso-studio
            const match = filename.match(/^(scheda|checklist|quiz|caso-studio)_(\d+)\.json$/);

            if (!match) continue;

            const [_, typeRaw, videoId] = match;
            report.found++;

            // Map raw type to DB enum
            let assetType = typeRaw.replace('-', '_'); // caso-studio -> caso_studio

            // Determine Level
            const vid = parseInt(videoId, 10);
            let level = 'base';
            if (vid >= 10 && vid <= 18) level = 'intermedio';
            if (vid >= 19) level = 'avanzato';

            // Read Content
            const contentRaw = fs.readFileSync(file, 'utf-8');
            let contentJson;
            try {
                contentJson = JSON.parse(contentRaw);
            } catch (e) {
                report.errors.push(`JSON Parse Error: ${filename}`);
                continue;
            }

            // Prepare Record
            const record = {
                video_id: videoId,
                type: assetType,
                level: level,
                title: contentJson.meta?.title || `${assetType} ${videoId}`,
                content: contentJson,
                version: 1,
                is_active: true
            };

            report.details.push({
                file: filename,
                action: execute ? 'UPSERT' : 'DRY-RUN',
                record: { ...record, content: '(omitted)' }
            });

            if (execute) {
                const { error } = await supabase
                    .from('educational_resources')
                    .upsert(record, { onConflict: 'video_id, type' });

                if (error) {
                    report.errors.push(`DB Error ${filename}: ${error.message}`);
                } else {
                    report.inserted++;
                }
            }
        }

        return NextResponse.json(report);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Helper: Recursive File Search
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        if (fs.statSync(dirPath + "\\" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "\\" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "\\", file));
        }
    });

    return arrayOfFiles;
}
