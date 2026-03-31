const fs = require('fs');

async function processImage() {
    const srcPath = 'C:\\\\Users\\\\simon\\\\simon silver caldaie\\\\certificato modello.png';
    const buffer = fs.readFileSync(srcPath);
    
    // Convert directly to Base64 (Sharp says it's a JPEG despite the .png extension)
    const base64Data = buffer.toString('base64');
    
    const fileContent = `// 4K High-Res JPEG Model\nexport const certificateTemplateBase64 = "data:image/jpeg;base64,${base64Data}";\n`;
    fs.writeFileSync('lib/certificateTemplate.ts', fileContent);
    console.log('Successfully updated lib/certificateTemplate.ts with the 4K model!');
}

processImage().catch(console.error);
