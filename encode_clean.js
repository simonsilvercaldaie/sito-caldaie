const fs = require('fs');

async function processImage() {
    const srcPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\media__1774883694156.png';
    const buffer = fs.readFileSync(srcPath);
    
    // Convert to Base64
    const base64Data = buffer.toString('base64');
    
    // Write to lib
    const fileContent = `export const certificateTemplateBase64 = "data:image/png;base64,${base64Data}";\n`;
    fs.writeFileSync('lib/certificateTemplate.ts', fileContent);
    console.log('Successfully updated lib/certificateTemplate.ts with the new clean AI template!');
}

processImage().catch(console.error);
