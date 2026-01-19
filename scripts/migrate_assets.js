const fs = require('fs');
const path = require('path');

const BASE_PATH = 'c:\\Users\\simon\\simon silver caldaie\\materiali_didattici';

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
    } catch (e) { }
    return arrayOfFiles;
}

// Helper: Parse MD Checklist
function parseChecklistMd(content, videoId, level) {
    const lines = content.split('\n');
    const phases = [];
    let currentPhase = null;
    let title = `Checklist Video ${videoId}`;
    let focus = "";

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        // Metadata
        if (line.startsWith('**Procedura:**')) focus = line.replace('**Procedura:**', '').trim();

        // Header
        if (line.startsWith('## ')) {
            if (currentPhase) phases.push(currentPhase);
            const phaseTitle = line.replace(/^##\s+(?:✅|📝)?\s*/, '').trim(); // Remove ## and optional emoji
            currentPhase = {
                title: phaseTitle,
                steps: []
            };
        }

        // Step
        if (line.startsWith('- [ ]') && currentPhase) {
            // Extract bold label and text
            // "- [ ] **Label:** Text"
            const textRaw = line.replace('- [ ]', '').trim();
            let label = textRaw;
            let text = "";

            const boldMatch = textRaw.match(/^\*\*(.*?):\*\*(.*)/);
            if (boldMatch) {
                label = boldMatch[1].trim();
                text = boldMatch[2].trim();
                // Combined for UI: "Label: Text" 
                // But our schema asks for `label` which usually means the whole text in simple checklists 
                // OR we map: id=derived, label = "Label: Text"
            }

            // Let's use the full text starting with Bold as the label
            const fullLabel = textRaw.replace(/\*\*/g, '');

            currentPhase.steps.push({
                id: `chk_${videoId}_${phases.length}_${currentPhase.steps.length}`,
                label: fullLabel,
                required: true
            });
        }
    });

    if (currentPhase) phases.push(currentPhase);

    return {
        meta: {
            video_id: videoId,
            type: 'checklist',
            title: title,
            last_updated: new Date().toISOString().split('T')[0]
        },
        content: {
            phases: phases
        }
    };
}

function migrate() {
    const files = getAllFiles(BASE_PATH);
    let converted = 0;
    let caseStudies = [];
    let reportLines = ["# Report Casi Studio", ""];

    // 1. Convert Checklists
    files.forEach(file => {
        if (file.endsWith('checklist_00.md')) return; // skip template if exists

        const filename = path.basename(file);
        const match = filename.match(/^checklist_(\d+)\.md$/);

        if (match) {
            const [_, videoId] = match;
            const vid = parseInt(videoId, 10);
            let level = 'base';
            if (vid >= 10) level = 'intermedio';
            if (vid >= 19) level = 'avanzato';

            const content = fs.readFileSync(file, 'utf-8');
            const jsonStructure = parseChecklistMd(content, videoId, level);

            const newPath = path.join(path.dirname(file), `checklist_${videoId}.json`);
            if (!fs.existsSync(newPath)) { // Idempotency: Don't overwrite if manual changes were made? No, explicit overwrite requested if different. Let's just write.
                fs.writeFileSync(newPath, JSON.stringify(jsonStructure, null, 2));
                console.log(`[CREATED] checklist_${videoId}.json`);
                converted++;
            } else {
                console.log(`[EXISTS] checklist_${videoId}.json (Skipped)`);
                converted++; // Count as handled
            }
        }

        // 2. Audit Case Studies
        if (filename.match(/^(caso[-_]studio|scenario)[-_](\d+)\.json$/)) {
            caseStudies.push(filename);
        }
    });

    // 3. Generate Report
    console.log("--- MIGRATION SUMMARY ---");
    console.log(`Checklists JSON: ${converted}/27`);

    console.log("--- CASE STUDIES ---");
    const foundIds = caseStudies.map(f => f.match(/(\d+)/)[1]);
    if (foundIds.length === 0) console.log("WARNING: 0 Case Studies found.");

    let mdReport = "# Case Studies Status\n\n";
    for (let i = 1; i <= 27; i++) {
        const id = i.toString().padStart(2, '0');
        const exists = foundIds.includes(id);
        mdReport += `- Video ${id}: ${exists ? "✅ Present" : "❌ MISSING"}\n`;
        if (!exists && i === 1) console.log(`STRANGE: Video 01 Case Study not found in list logic? List: ${caseStudies.join(',')}`);
    }

    fs.writeFileSync(path.join(BASE_PATH, 'case_studies_status.md'), mdReport);
    console.log("Report generated: case_studies_status.md");
}

migrate();
