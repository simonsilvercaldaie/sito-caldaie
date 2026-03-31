const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
    const src = 'public/certificate_template.png';
    const metadata = await sharp(src).metadata();

    // We will extract patches of pristine background from the image itself
    
    // Patch 1: Top empty gap (Y=260 to 320) -> extremely clean texture.
    // We can use this to cover Marco Bianchi (H: 70), Termoidraulica (H: 40), and Metodo UKT (H: 40)
    const bgPatchTop = await sharp(src).extract({ left: 150, top: 260, width: 724, height: 60 }).toBuffer();
    
    // We need 70px for Marco Bianchi, so we'll just stack bgPatchTop twice (or use resize to stretch slightly)
    const patchMarco = await sharp(bgPatchTop).resize({ width: 624, height: 75, fit: 'fill' }).toBuffer();
    const patchTermo = await sharp(bgPatchTop).resize({ width: 624, height: 45, fit: 'fill' }).toBuffer();
    const patchMetodo = await sharp(bgPatchTop).resize({ width: 724, height: 45, fit: 'fill' }).toBuffer();

    // Patch 2: Bottom empty gap (Y=955 to 1015) -> clean texture for the bottom section
    const bgPatchBottom = await sharp(src).extract({ left: 120, top: 955, width: 460, height: 60 }).toBuffer();
    const patchDate = await sharp(bgPatchBottom).resize({ width: 460, height: 60, fit: 'fill' }).toBuffer();

    // Now we composite these authentic texture patches over the original text to ERASE it seamlessly
    let cleanedBuffer = await sharp(src)
        .composite([
            { input: patchMarco, top: 420, left: 200 },
            { input: patchTermo, top: 580, left: 200 },
            { input: patchMetodo, top: 710, left: 150 },
            { input: patchDate, top: 825, left: 120 }
        ])
        .toBuffer();

    // Draw the requested static text OVER the newly cleaned background
    const svgText = `
        <svg width="1024" height="1024">
            <!-- 2-line Title -->
            <text x="512" y="740" font-family="Montserrat, Arial, sans-serif" font-weight="900" font-size="28" fill="#111827" text-anchor="middle">SIMON SILVER CALDAIE</text>
            <text x="512" y="772" font-family="Montserrat, Arial, sans-serif" font-weight="800" font-size="26" fill="#111827" text-anchor="middle">Diagnostica Avanzata Caldaie</text>
            
            <!-- Exact string requested: "Data di completamento: " -->
            <text x="140" y="865" font-family="Times New Roman, Arial, sans-serif" font-size="18" fill="#2d3748" text-anchor="start">Data di completamento: </text>
        </svg>
    `;

    cleanedBuffer = await sharp(cleanedBuffer)
        .composite([{ input: Buffer.from(svgText), blend: 'over' }])
        .png()
        .toBuffer();

    // STRETCHING TO A4
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

    const finalPath = 'public/certificate_portrait_optimized.png';
    await sharp({
        create: { width: newWidth, height: newHeight, channels: 3, background: { r: 255, g: 255, b: 255 } }
    })
    .composite(compositeArr)
    .toFile(finalPath);

    const destPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\optimized_portrait_v4.png';
    fs.copyFileSync(finalPath, destPath);

    console.log('Successfully created v4 with seamless texture patching!');
}

processImage().catch(console.error);
