const fs = require('fs');
const src = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\media__1774874674241.png';
const dest = 'public/certificate_template_final.png';

fs.copyFileSync(src, dest);
console.log('Copied to public/certificate_template_final.png');

const base64Data = fs.readFileSync(dest).toString('base64');
const tsContent = `export const certificateTemplateBase64 = "data:image/png;base64,${base64Data}";\n`;

fs.writeFileSync('lib/certificateTemplate.ts', tsContent);
console.log('Updated lib/certificateTemplate.ts with new Base64');
