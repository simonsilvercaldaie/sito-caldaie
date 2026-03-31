const sharp = require('sharp');

async function processImage() {
    const src = 'public/certificate_template.png';
    const metadata = await sharp(src).metadata();
    console.log(metadata.width, metadata.height);

    // We want to stretch from 1024 to 1448 (A4 ratio)
    const newWidth = 1024;
    const newHeight = 1448;

    // Define slices [yStart, height] of the ORIGINAL image to stretch
    const stretchSlices = [
        { y: 80, h: 5, add: 100 },   // stretch 1 (above logo)
        { y: 390, h: 5, add: 100 },  // stretch 2 (below logo)
        { y: 640, h: 5, add: 100 },  // stretch 3 (below flame / name)
        { y: 780, h: 5, add: 124 }   // stretch 4 (above bottom section)
    ];

    const compositeArr = [];
    let currentSrcY = 0;
    let currentDestY = 0;

    for (const slice of stretchSlices) {
        // 1. The chunk BEFORE the stretch
        const chunkH = slice.y - currentSrcY;
        if (chunkH > 0) {
            const chunkBuf = await sharp(src).extract({ left: 0, top: currentSrcY, width: newWidth, height: chunkH }).toBuffer();
            compositeArr.push({ input: chunkBuf, top: currentDestY, left: 0 });
            currentDestY += chunkH;
        }

        // 2. The STRETCHED slice
        const sliceBuf = await sharp(src).extract({ left: 0, top: slice.y, width: newWidth, height: slice.h }).toBuffer();
        const stretchedBuf = await sharp(sliceBuf).resize(newWidth, slice.h + slice.add, { fit: 'fill' }).toBuffer();
        compositeArr.push({ input: stretchedBuf, top: currentDestY, left: 0 });
        currentDestY += slice.h + slice.add;

        currentSrcY = slice.y + slice.h;
    }

    // 3. The LAST chunk to the bottom
    const lastH = metadata.height - currentSrcY;
    if (lastH > 0) {
        const lastBuf = await sharp(src).extract({ left: 0, top: currentSrcY, width: newWidth, height: lastH }).toBuffer();
        compositeArr.push({ input: lastBuf, top: currentDestY, left: 0 });
    }

    // Create a blank image and composite together
    await sharp({
        create: { width: newWidth, height: newHeight, channels: 3, background: { r: 255, g: 255, b: 255 } }
    })
    .composite(compositeArr)
    .toFile('public/certificate_portrait.png');

    console.log('Successfully created seamless portrait A4 background at public/certificate_portrait.png');
}

processImage().catch(console.error);
