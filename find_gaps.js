const sharp = require('sharp');

async function findGaps() {
    const src = 'public/certificate_template.png';
    const { data, info } = await sharp(src)
        .raw()
        .toBuffer({ resolveWithObject: true });

    // Look at column X = 250 (inside the left border, but likely left of most text)
    // Actually better, look at a column where text definitely exists, to find the gaps between text lines!
    // Center is 512. Text is centered. Let's check X = 512.
    // Wait, logo and flames are at 512. 
    // Let's just calculate the standard deviation of brightness for each row!
    // If a row has only background (cream color), its pixels will barely vary from the mean.
    // If a row has text, the text pixels (dark) will cause a high variance against the cream background.
    
    console.log("Analyzing row variance to find blank spaces...");
    const safeRows = [];
    
    for (let y = 0; y < info.height; y++) {
        let sum = 0;
        let sumSq = 0;
        let count = 0;
        
        // Scan from X=100 to X=924 to ignore the side borders completely
        for (let x = 100; x < info.width - 100; x++) {
            const idx = (y * info.width + x) * info.channels;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            // Simple grayscale brightness
            const brightness = (r + g + b) / 3;
            sum += brightness;
            sumSq += brightness * brightness;
            count++;
        }
        
        const mean = sum / count;
        const variance = (sumSq / count) - (mean * mean);
        
        if (variance < 10) { // Very little variation means it's a solid/gradient line
            safeRows.push(y);
        }
    }

    // Output contiguous blocks of safe rows
    let blocks = [];
    let currentBlock = [];
    for (let i = 0; i < safeRows.length; i++) {
        if (currentBlock.length === 0 || safeRows[i] === safeRows[i-1] + 1) {
            currentBlock.push(safeRows[i]);
        } else {
            blocks.push(currentBlock);
            currentBlock = [safeRows[i]];
        }
    }
    if (currentBlock.length > 0) blocks.push(currentBlock);

    blocks.forEach((block, i) => {
        if (block.length > 5) { // Only log significant gaps
            console.log(`Gap ${i}: Y=${block[0]} to Y=${block[block.length - 1]} (Height: ${block.length})`);
        }
    });
}

findGaps().catch(console.error);
