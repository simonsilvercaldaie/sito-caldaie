const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, 'public', 'certificate_template.png');
const outputPath = path.join(__dirname, 'lib', 'certificateTemplate.ts');

const base64Data = fs.readFileSync(imagePath).toString('base64');
const tsContent = `export const certificateTemplateB64 = '${base64Data}';\n`;

fs.writeFileSync(outputPath, tsContent);
console.log('Successfully generated base64 template');
