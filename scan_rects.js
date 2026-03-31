const sharp = require('sharp');
const fs = require('fs');

async function scanRects() {
    const srcPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\media__1774875756273.png';
    const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });

    console.log(`Image Size: ${info.width}x${info.height}`);

    let redPixels = [];
    for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
            const idx = (y * info.width + x) * info.channels;
            const r = data[idx];
            const g = data[idx+1];
            const b = data[idx+2];
            // Detect strong red
            if (r > 200 && g < 80 && b < 80) {
                redPixels.push({x, y});
            }
        }
    }

    console.log(`Found ${redPixels.length} red pixels.`);

    if (redPixels.length === 0) return;

    // Cluster them into bounding boxes
    let boxes = [];
    for (const p of redPixels) {
        let added = false;
        for (let b of boxes) {
            // If pixel is close to an existing box, expand the box
            if (p.x >= b.minX - 10 && p.x <= b.maxX + 10 &&
                p.y >= b.minY - 10 && p.y <= b.maxY + 10) {
                if (p.x < b.minX) b.minX = p.x;
                if (p.x > b.maxX) b.maxX = p.x;
                if (p.y < b.minY) b.minY = p.y;
                if (p.y > b.maxY) b.maxY = p.y;
                added = true;
                break;
            }
        }
        if (!added) {
            boxes.push({minX: p.x, maxX: p.x, minY: p.y, maxY: p.y});
        }
    }

    // Merge overlapping boxes (naive)
    let merged = true;
    while(merged) {
        merged = false;
        for (let i=0; i<boxes.length; i++) {
            for (let j=i+1; j<boxes.length; j++) {
                const b1 = boxes[i];
                const b2 = boxes[j];
                if (!(b1.maxX < b2.minX || b1.minX > b2.maxX || b1.maxY < b2.minY || b1.minY > b2.maxY)) {
                    b1.minX = Math.min(b1.minX, b2.minX);
                    b1.maxX = Math.max(b1.maxX, b2.maxX);
                    b1.minY = Math.min(b1.minY, b2.minY);
                    b1.maxY = Math.max(b1.maxY, b2.maxY);
                    boxes.splice(j, 1);
                    merged = true;
                    break;
                }
            }
            if (merged) break;
        }
    }

    // Sort boxes top to bottom
    boxes.sort((a,b) => a.minY - b.minY);

    boxes.forEach((b, i) => {
        b.width = b.maxX - b.minX;
        b.height = b.maxY - b.minY;
        b.centerX = b.minX + (b.width / 2);
        b.centerY = b.minY + (b.height / 2);
        // pdf-lib Y coords are from bottom, so pdfY = info.height - imgY
        b.pdfY = info.height - b.minY; // Top of the box in PDF coords
        b.pdfYCenter = info.height - b.centerY; // Center of the box in PDF coords
        b.pdfYBottom = info.height - b.maxY; // Bottom of the box in PDF coords
        console.log(`BOX ${i+1}: minX=${b.minX}, maxX=${b.maxX}, minY=${b.minY}, maxY=${b.maxY}`);
        console.log(`         Width=${b.width}, Height=${b.height}, CenterX=${b.centerX}, CenterY=${b.centerY}`);
        console.log(`         PDF-LIB Coords: Y(center) = ${b.pdfYCenter}, Y(base) approx = ${b.pdfYBottom + 5}`);
    });
}

scanRects().catch(console.error);
