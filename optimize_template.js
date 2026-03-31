const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
    const src = 'public/certificate_template.png';
    const metadata = await sharp(src).metadata();

    // 1. First, create the CLEANED 1024x1024 base image by masking out dynamic fields and "Metodo UKT"
    const svgMask = `
        <svg width="1024" height="1024">
            <!-- Mask Marco Bianchi -->
            <rect x="200" y="420" width="624" height="75" fill="#fdfbf6" />
            
            <!-- Mask Termoidraulica Rossi -->
            <rect x="250" y="580" width="524" height="40" fill="#fcfaf5" />
            
            <!-- Mask SIMON SILVER CALDAIE - Metodo UKT -->
            <rect x="180" y="710" width="664" height="40" fill="#fbf9f4" />
            
            <!-- Mask Date (Left side only) -->
            <rect x="140" y="835" width="450" height="35" fill="#fcfbf8" />
        </svg>
    `;

    const cleanedBuffer = await sharp(src)
        .composite([{ input: Buffer.from(svgMask), blend: 'over' }])
        .png()
        .toBuffer();

    // 2. Now perform the perfectly balanced STRETCHING on the cleaned image
    const newWidth = 1024;
    const newHeight = 1448; // Exactly A4 ratio height

    // Optimal stretches based on structural pacing:
    // 1. Below Logo to separate header (Y=290 is safe, gap is Y=260-320)
    // 2. Below title/certifica (Y=370 is safe, gap is Y=360-380)
    // 3. Below Company (Y=620 is safe, gap is Y=610-625)
    // 4. Above bottom signature block (Y=825 is safe, gap is Y=810-830)
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
        // Chunk before
        const chunkH = slice.y - currentSrcY;
        if (chunkH > 0) {
            const chunkBuf = await sharp(cleanedBuffer).extract({ left: 0, top: currentSrcY, width: newWidth, height: chunkH }).toBuffer();
            compositeArr.push({ input: chunkBuf, top: currentDestY, left: 0 });
            currentDestY += chunkH;
        }

        // Stretch portion
        const sliceBuf = await sharp(cleanedBuffer).extract({ left: 0, top: slice.y, width: newWidth, height: slice.h }).toBuffer();
        const stretchedBuf = await sharp(sliceBuf).resize(newWidth, slice.h + slice.add, { fit: 'fill' }).toBuffer();
        compositeArr.push({ input: stretchedBuf, top: currentDestY, left: 0 });
        currentDestY += slice.h + slice.add;

        currentSrcY = slice.y + slice.h;
    }

    // Final chunk
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

    // Also copy it to the artifact directory so the user can see it!
    const destPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\optimized_portrait.png';
    fs.copyFileSync(finalPath, destPath);

    console.log('Successfully created, masked, and stretched portrait A4 image!');
}

processImage().catch(console.error);
