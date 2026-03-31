const sharp = require('sharp');

async function mapRows() {
    const src = 'public/certificate_template.png';
    const { data, info } = await sharp(src)
        .raw()
        .toBuffer({ resolveWithObject: true });

    console.log("Mapping Y rows...");
    
    let out = '';
    // Let's sample every 10th row
    for (let y = 0; y < info.height; y += 10) {
        let sumSq = 0;
        let count = 0;
        
        // Scan central column block (X=300 to X=724) to completely avoid borders
        for (let x = 300; x < info.width - 300; x++) {
            const idx = (y * info.width + x) * info.channels;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const brightness = (r + g + b) / 3;
            sumSq += brightness * brightness;
            count++;
        }
        
        const meanSq = sumSq / count;
        // Background is around ~250 brightness. Text is dark (<100).
        // If there's any dark pixel, the minimum brightness in that row will be low.
        
        let minB = 255;
        for (let x = 300; x < info.width - 300; x++) {
            const idx = (y * info.width + x) * info.channels;
            const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
            if (brightness < minB) minB = brightness;
        }

        const isText = minB < 150 ? "█ TEXT " : "  gap  ";
        out += `Y=${y.toString().padStart(4, '0')} : ${isText} (min: ${Math.round(minB)})\n`;
    }
    
    require('fs').writeFileSync('public/row_map.txt', out);
    console.log('Map saved to public/row_map.txt');
}

mapRows().catch(console.error);
