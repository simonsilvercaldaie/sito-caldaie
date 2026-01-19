const fs = require('fs');
const path = require('path');

const BASE_PATH = 'c:\\Users\\simon\\simon silver caldaie\\materiali_didattici';
const OUTPUT_FILE = 'c:\\Users\\simon\\simon silver caldaie\\sito\\seed_educational_resources.sql';

// Helper: Escape SQL
function escapeSql(str) {
    if (typeof str !== 'string') return str;
    // Replace single quotes with double single quotes
    return str.replace(/'/g, "''");
}

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
    } catch (e) { }
    return arrayOfFiles;
}

function generateSql() {
    const files = getAllFiles(BASE_PATH);
    let sqlContent = `-- SEEDING SCRIPT for Educational Resources\n`;
    sqlContent += `-- Generated at: ${new Date().toISOString()}\n\n`;

    let stats = { scheda: 0, checklist: 0, quiz: 0, caso_studio: 0 };

    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filename = path.basename(file);
        const match = filename.match(/^(scheda|checklist|quiz|caso-studio)[_-](\d+)\.json$/);

        if (!match) continue;
        if (filename.includes('formati_standard')) continue;

        const [_, typeRaw, videoId] = match;
        const assetType = typeRaw.replace('-', '_'); // caso-studio -> caso_studio

        // Level Logic
        // 01-09 Base
        // 10-18 Intermediate
        // 19-27 Advanced
        const vid = parseInt(videoId, 10);
        let level = 'base';
        if (vid >= 10 && vid <= 18) level = 'intermedio';
        if (vid >= 19) level = 'avanzato';

        console.log(`Processing ${filename}...`);

        // Read JSON
        let contentJson;
        try {
            const raw = fs.readFileSync(file, 'utf-8');
            contentJson = JSON.parse(raw);
        } catch (e) {
            console.error(`Error parsing ${filename}`);
            continue;
        }

        const title = escapeSql(contentJson.meta?.title || `${assetType} Video ${videoId}`);
        const jsonString = JSON.stringify(contentJson);
        const jsonEscaped = escapeSql(jsonString); // Correctly escape for SQL literal

        // SQL Statement
        // Using ON CONFLICT (video_id, type) DO UPDATE...
        sqlContent += `
INSERT INTO educational_resources (video_id, type, level, title, content, version, is_active)
VALUES (
  '${videoId}',
  '${assetType}',
  '${level}',
  '${title}',
  '${jsonEscaped}'::jsonb,
  1,
  true
)
ON CONFLICT (video_id, type) 
DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  version = educational_resources.version + 1,
  updated_at = now();
`;

        if (stats[assetType] !== undefined) stats[assetType]++;
    }

    fs.writeFileSync(OUTPUT_FILE, sqlContent);
    console.log("--- GENERATION COMPLETE ---");
    console.table(stats);
}

generateSql();
