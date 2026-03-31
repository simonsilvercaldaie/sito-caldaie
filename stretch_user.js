const sharp = require('sharp');
const fs = require('fs');

const srcPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\media__1774874195883.png';

async function stretchUserImage() {
    const destPath = 'public/certificate_user_provided.png';
    fs.copyFileSync(srcPath, destPath);

    const metadata = await sharp(destPath).metadata();
    console.log(`Original size: ${metadata.width}x${metadata.height}`);

    const newWidth = metadata.width;
    const newHeight = Math.round(metadata.width * 1.414); // A4 portrait ratio

    console.log(`Target size: ${newWidth}x${newHeight}`);

    // Let's algorithmically find the best gaps in HIS image.
    const { data: rawData, info } = await sharp(destPath).raw().toBuffer({ resolveWithObject: true });
    
    const rowVariances = [];
    for (let y = 0; y < info.height; y++) {
        let sum = 0, sumSq = 0, count = 0;
        // Avoid borders - sample middle X=250 to X=774
        for (let x = 250; x < info.width - 250; x++) {
            const idx = (y * info.width + x) * info.channels;
            const r = rawData[idx];
            const g = rawData[idx+1];
            const b = rawData[idx+2];
            const val = (r + g + b) / 3;
            sum += val;
            sumSq += val * val;
            count++;
        }
        const mean = sum/count;
        const variance = (sumSq/count) - (mean*mean);
        rowVariances.push(variance);
    }

    // Find 4 largest stretches of variance < 10 (which means it's a solid/gradient block horizontally)
    let blocks = [];
    let currentBlock = [];
    for (let y = 0; y < info.height; y++) {
        // Find safe block. Ignore top and bottom margins (y<50, y>height-50)
        if (y > 50 && y < info.height - 50 && rowVariances[y] < 10) {
            currentBlock.push(y);
        } else {
            if (currentBlock.length > 0) {
                blocks.push(currentBlock);
                currentBlock = [];
            }
        }
    }
    if (currentBlock.length > 0) blocks.push(currentBlock);

    blocks.sort((a, b) => b.length - a.length);

    console.log('Top 4 safest Gaps found:');
    const chosenGaps = [];
    for (let i = 0; i < Math.min(4, blocks.length); i++) {
        const blk = blocks[i];
        console.log(`Gap ${i+1}: Y=${blk[0]} to Y=${blk[blk.length-1]} (H=${blk.length})`);
        
        // Pick the middle point of the gap to stretch! 
        // Or if it's very large, pick the 10th pixel inward to be safe.
        const center = Math.round((blk[0] + blk[blk.length-1]) / 2);
        chosenGaps.push(center);
    }

    chosenGaps.sort((a,b) => a - b); // Sort by Y ascending

    const toAdd = newHeight - metadata.height;
    const addPerGap = Math.round(toAdd / chosenGaps.length);
    
    let totalAdded = 0;
    const stretchSlices = chosenGaps.map((g, idx) => {
        let add = addPerGap;
        if (idx === chosenGaps.length - 1) {
            add = toAdd - totalAdded; // Remainder
        }
        totalAdded += add;
        return { y: g, h: 5, add: add };
    });

    console.log('Stretching at these Y slices:', stretchSlices);

    // COMPOSITE IT
    const compositeArr = [];
    let currentSrcY = 0;
    let currentDestY = 0;

    for (const slice of stretchSlices) {
        const chunkH = slice.y - currentSrcY;
        if (chunkH > 0) {
            const chunkBuf = await sharp(destPath).extract({ left: 0, top: currentSrcY, width: newWidth, height: chunkH }).toBuffer();
            compositeArr.push({ input: chunkBuf, top: currentDestY, left: 0 });
            currentDestY += chunkH;
        }

        const sliceBuf = await sharp(destPath).extract({ left: 0, top: slice.y, width: newWidth, height: slice.h }).toBuffer();
        const stretchedBuf = await sharp(sliceBuf).resize(newWidth, slice.h + slice.add, { fit: 'fill' }).toBuffer();
        compositeArr.push({ input: stretchedBuf, top: currentDestY, left: 0 });
        currentDestY += slice.h + slice.add;

        currentSrcY = slice.y + slice.h;
    }

    const lastH = metadata.height - currentSrcY;
    if (lastH > 0) {
        const lastBuf = await sharp(destPath).extract({ left: 0, top: currentSrcY, width: newWidth, height: lastH }).toBuffer();
        compositeArr.push({ input: lastBuf, top: currentDestY, left: 0 });
    }

    const finalPath = 'public/certificate_portrait_user.png';
    await sharp({
        create: { width: newWidth, height: newHeight, channels: 3, background: { r: 255, g: 255, b: 255 } }
    })
    .composite(compositeArr)
    .toFile(finalPath);

    // Export to artifact
    const artifactPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\final_user_portrait.png';
    fs.copyFileSync(finalPath, artifactPath);
    console.log('DONE. Artifact saved at:', artifactPath);
}

stretchUserImage().catch(console.error);
