const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
    const src = 'public/certificate_template.png';
    const metadata = await sharp(src).metadata();

    // 1. EXTRACT AUTHENTIC BACKGROUND PATCHES
    // To completely overwrite old text while keeping the authentic gradient.
    const bgPatchTop = await sharp(src).extract({ left: 150, top: 260, width: 724, height: 60 }).toBuffer();
    
    const patchMarco = await sharp(bgPatchTop).resize({ width: 624, height: 75, fit: 'fill' }).toBuffer();
    const patchTermo = await sharp(bgPatchTop).resize({ width: 624, height: 45, fit: 'fill' }).toBuffer();
    const patchMetodo = await sharp(bgPatchTop).resize({ width: 724, height: 45, fit: 'fill' }).toBuffer();

    const bgPatchBottom = await sharp(src).extract({ left: 120, top: 955, width: 460, height: 60 }).toBuffer();
    const patchDate = await sharp(bgPatchBottom).resize({ width: 460, height: 60, fit: 'fill' }).toBuffer();

    // Composite patches over old text
    let cleanedBuffer = await sharp(src)
        .composite([
            { input: patchMarco, top: 420, left: 200 },
            { input: patchTermo, top: 580, left: 200 },
            { input: patchMetodo, top: 710, left: 150 },
            { input: patchDate, top: 825, left: 120 }
        ])
        .toBuffer();

    // 2. DRAW NEW TEXT EXACTLY AS REQUESTED
    const svgText = `
        <svg width="1024" height="1024">
            <!-- 2-line Title (Montserrat/Arial style, perfectly stacked) -->
            <text x="512" y="735" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="28" fill="#111827" text-anchor="middle">SIMON SILVER CALDAIE</text>
            <text x="512" y="768" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="25" fill="#111827" text-anchor="middle">Diagnostica Avanzata Caldaie</text>
            
            <!-- Date Label (Clean sans-serif) -->
            <text x="140" y="865" font-family="Arial, Helvetica, sans-serif" font-weight="normal" font-size="18" fill="#111827" text-anchor="start">Data di completamento:</text>
        </svg>
    `;

    cleanedBuffer = await sharp(cleanedBuffer)
        .composite([{ input: Buffer.from(svgText), blend: 'over' }])
        .png()
        .toBuffer();

    // 3. SEAM CARVING (STRETCHING) TO PERFECT A4 PORTRAIT
    const newWidth = 1024;
    const newHeight = 1448; // Exact A4 ratio

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
        // Unstretched segment
        const chunkH = slice.y - currentSrcY;
        if (chunkH > 0) {
            const chunkBuf = await sharp(cleanedBuffer).extract({ left: 0, top: currentSrcY, width: newWidth, height: chunkH }).toBuffer();
            compositeArr.push({ input: chunkBuf, top: currentDestY, left: 0 });
            currentDestY += chunkH;
        }

        // Stretched segment (elongating 5px to essentially a smooth gradient bridge)
        const sliceBuf = await sharp(cleanedBuffer).extract({ left: 0, top: slice.y, width: newWidth, height: slice.h }).toBuffer();
        const stretchedBuf = await sharp(sliceBuf).resize(newWidth, slice.h + slice.add, { fit: 'fill' }).toBuffer();
        compositeArr.push({ input: stretchedBuf, top: currentDestY, left: 0 });
        currentDestY += slice.h + slice.add;

        currentSrcY = slice.y + slice.h;
    }

    // Bottom segment
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

    // Copy to UI for validation
    const destPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\optimized_portrait_v5.png';
    fs.copyFileSync(finalPath, destPath);

    console.log('Successfully created v5 matching user mockup!');
}

processImage().catch(console.error);
