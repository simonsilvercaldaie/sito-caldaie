const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
    const src = 'public/certificate_template.png';
    const metadata = await sharp(src).metadata();

    const svgMask = `
        <svg width="1024" height="1024">
            <!-- Mask Marco Bianchi -->
            <rect x="200" y="420" width="624" height="80" fill="#fdfcf8" />
            
            <!-- Mask Termoidraulica Rossi -->
            <rect x="200" y="580" width="624" height="45" fill="#fefdf9" />
            
            <!-- Mask SIMON SILVER CALDAIE - Metodo UKT AND Diagnostica Avanzata -->
            <rect x="150" y="710" width="724" height="70" fill="#fefcf8" />
            
            <!-- Redraw perfectly centered -->
            <text x="512" y="740" font-family="Montserrat, Arial, sans-serif" font-weight="900" font-size="28" fill="#111827" text-anchor="middle">SIMON SILVER CALDAIE</text>
            <text x="512" y="772" font-family="Montserrat, Arial, sans-serif" font-weight="800" font-size="26" fill="#111827" text-anchor="middle">Diagnostica Avanzata Caldaie</text>
            
            <!-- Mask Date (Left side only) completely -->
            <rect x="120" y="825" width="460" height="60" fill="#fefcf8" />
        </svg>
    `;

    const cleanedBuffer = await sharp(src)
        .composite([{ input: Buffer.from(svgMask), blend: 'over' }])
        .png()
        .toBuffer();

    // 2. STRETCHING
    const newWidth = 1024;
    const newHeight = 1448;

    const stretchSlices = [
        { y: 290, h: 5, add: 100 }, 
        { y: 370, h: 5, add: 80 }, 
        { y: 620, h: 5, add: 100 }, 
        { y: 825, h: 5, add: 144 }
    ];

    const compositeArr = [];
    let currentSrcY = 0;
    let currentDestY = 0;

    for (const slice of stretchSlices) {
        const chunkH = slice.y - currentSrcY;
        if (chunkH > 0) {
            const chunkBuf = await sharp(cleanedBuffer).extract({ left: 0, top: currentSrcY, width: newWidth, height: chunkH }).toBuffer();
            compositeArr.push({ input: chunkBuf, top: currentDestY, left: 0 });
            currentDestY += chunkH;
        }

        const sliceBuf = await sharp(cleanedBuffer).extract({ left: 0, top: slice.y, width: newWidth, height: slice.h }).toBuffer();
        const stretchedBuf = await sharp(sliceBuf).resize(newWidth, slice.h + slice.add, { fit: 'fill' }).toBuffer();
        compositeArr.push({ input: stretchedBuf, top: currentDestY, left: 0 });
        currentDestY += slice.h + slice.add;

        currentSrcY = slice.y + slice.h;
    }

    const lastH = metadata.height - currentSrcY;
    if (lastH > 0) {
        const lastBuf = await sharp(cleanedBuffer).extract({ left: 0, top: currentSrcY, width: newWidth, height: lastH }).toBuffer();
        compositeArr.push({ input: lastBuf, top: currentDestY, left: 0 });
    }

    const finalPath = 'public/certificate_portrait_optimized.png'; // Overwrite
    await sharp({
        create: { width: newWidth, height: newHeight, channels: 3, background: { r: 255, g: 255, b: 255 } }
    })
    .composite(compositeArr)
    .toFile(finalPath);

    const destPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\optimized_portrait_v3.png';
    fs.copyFileSync(finalPath, destPath);

    console.log('Successfully created v3!');
}

processImage().catch(console.error);
