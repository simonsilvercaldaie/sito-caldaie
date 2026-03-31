const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
    const srcPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\media__1774877729650.png';
    const outputImagePath = 'cleaned_template_ai.png';
    
    // Read raw data
    const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
    
    // Copy the buffer to modify it
    const cloneData = Buffer.from(data);

    let redPixelsFound = 0;
    for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
            const idx = (y * info.width + x) * info.channels;
            const r = cloneData[idx];
            const g = cloneData[idx+1];
            const b = cloneData[idx+2];
            
            // Detect strong red marker logic.
            if (r > 200 && g < 80 && b < 80) {
                // Determine if this pixel lies inside the 3 BIG red rectangles.
                // Rectangle 1 (Name): Y roughly between 450 and 560
                // Rectangle 2 (Company): Y roughly between 630 and 740
                // Rectangle 3 (Date): Y roughly between 880 and 950
                
                const isNameBox = (y > 450 && y < 580);
                const isCompanyBox = (y > 620 && y < 750);
                const isDateBox = (y > 880 && y < 960);
                
                if (isNameBox || isCompanyBox || isDateBox) {
                    // Turn it to solid white (#FFFFFF)
                    cloneData[idx] = 255;
                    cloneData[idx+1] = 255;
                    cloneData[idx+2] = 255;
                    if (info.channels === 4) {
                        cloneData[idx+3] = 255; // alpha
                    }
                    redPixelsFound++;
                }
            }
        }
    }
    
    console.log(`Replaced ${redPixelsFound} red pixels with white (sparing the Logo Flames!).`);
    
    // Re-encode cleaned image
    const cleanedBuffer = await sharp(cloneData, {
        raw: {
            width: info.width,
            height: info.height,
            channels: info.channels
        }
    })
    .png()
    .toBuffer();
    
    fs.writeFileSync(outputImagePath, cleanedBuffer);
    console.log(`Saved cleaned image to ${outputImagePath}`);
    
    // Convert to Base64
    const base64Data = cleanedBuffer.toString('base64');
    
    // Ensure data URI prefix is intact for generic viewers
    const fileContent = `export const certificateTemplateBase64 = "data:image/png;base64,${base64Data}";\n`;
    fs.writeFileSync('lib/certificateTemplate.ts', fileContent);
    console.log('Successfully updated lib/certificateTemplate.ts with cleaned AI template!');
}

processImage().catch(console.error);
