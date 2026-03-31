const sharp = require('sharp');
const fs = require('fs');

async function scaleLogoSeamless() {
    const srcPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\final_user_portrait.png';
    const destPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\final_user_portrait_big_logo_perfect.png';
    
    // 1. Extract the logo block exactly
    const logoCropWidth = 470;
    const logoCropHeight = 250;
    const logoX = 277; // roughly centered (512 - 235)
    // In final_user_portrait, the logo starts slightly higher. Gap 4 pushed the bottom down.
    // The logo is actually roughly between Y=100 and Y=350. Let's extract Y=120.
    const logoY = 120; 
    
    let logoBuffer = await sharp(srcPath)
        .extract({ left: logoX, top: logoY, width: logoCropWidth, height: logoCropHeight })
        .toBuffer();
        
    // 2. Erase the old logo entirely using the beautiful clean background patch from Gap 3 (Y=310-370)
    // We will stretch an authentic textured patch to cover the whole logo box so it's invisible.
    const bgPatch = await sharp(srcPath).extract({ left: logoX, top: 310, width: logoCropWidth, height: 40 }).toBuffer();
    const coverPatch = await sharp(bgPatch).resize(logoCropWidth, logoCropHeight + 10, { fit: 'fill' }).toBuffer();
    
    let cleanBg = await sharp(srcPath)
        .composite([{ input: coverPatch, top: logoY - 5, left: logoX }])
        .toBuffer();

    // 3. Scale the extracted logo by 1.4x
    const scaledW = Math.round(logoCropWidth * 1.4);
    const scaledH = Math.round(logoCropHeight * 1.4);
    
    // Resize high quality
    let scaledLogo = await sharp(logoBuffer)
        .resize({ width: scaledW, height: scaledH, kernel: sharp.kernel.lanczos3 })
        .toBuffer();

    // 4. Composite the new huge logo over the cleaned background using 'multiply' blend.
    // The cream background of the logo will vanish entirely, merging with the cream background seamlessly!
    const destX = Math.round(512 - (scaledW / 2));
    const destY = Math.round((logoY + (logoCropHeight / 2)) - (scaledH / 2));
    
    const finalBuffer = await sharp(cleanBg)
        .composite([{ input: scaledLogo, left: destX, top: destY, blend: 'multiply' }])
        .toBuffer();

    await sharp(finalBuffer).toFile(destPath);
    console.log("SUCCESS. Created final_user_portrait_big_logo_perfect.png");
}

scaleLogoSeamless().catch(console.error);
