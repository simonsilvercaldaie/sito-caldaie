const sharp = require('sharp');

async function processImage() {
    const src = 'public/certificate_template.png';
    const metadata = await sharp(src).metadata();

    const newWidth = 1024;
    const newHeight = 1448; // Exactly A4 ratio height

    // Use precisely detected empty gaps from algorithmic analysis
    const stretchSlices = [
        { y: 540, h: 5, add: 106 }, 
        { y: 615, h: 5, add: 106 }, 
        { y: 665, h: 5, add: 106 }, 
        { y: 820, h: 5, add: 106 }
    ];

    const compositeArr = [];
    let currentSrcY = 0;
    let currentDestY = 0;

    // Build the stretched composite sections
    for (const slice of stretchSlices) {
        // Normal unstretched section
        const chunkH = slice.y - currentSrcY;
        if (chunkH > 0) {
            const chunkBuf = await sharp(src).extract({ left: 0, top: currentSrcY, width: newWidth, height: chunkH }).toBuffer();
            compositeArr.push({ input: chunkBuf, top: currentDestY, left: 0 });
            currentDestY += chunkH;
        }

        // Stretched section to cover the A4 height cleanly
        const sliceBuf = await sharp(src).extract({ left: 0, top: slice.y, width: newWidth, height: slice.h }).toBuffer();
        const stretchedBuf = await sharp(sliceBuf).resize(newWidth, slice.h + slice.add, { fit: 'fill' }).toBuffer();
        compositeArr.push({ input: stretchedBuf, top: currentDestY, left: 0 });
        currentDestY += slice.h + slice.add;

        currentSrcY = slice.y + slice.h;
    }

    // Last bottom chunk untouched
    const lastH = metadata.height - currentSrcY;
    if (lastH > 0) {
        const lastBuf = await sharp(src).extract({ left: 0, top: currentSrcY, width: newWidth, height: lastH }).toBuffer();
        compositeArr.push({ input: lastBuf, top: currentDestY, left: 0 });
    }

    await sharp({
        create: { width: newWidth, height: newHeight, channels: 3, background: { r: 255, g: 255, b: 255 } }
    })
    .composite(compositeArr)
    .toFile('public/certificate_portrait_fixed.png');

    console.log('Successfully created flawlessly stretched vertical A4 background');
}

processImage().catch(console.error);
