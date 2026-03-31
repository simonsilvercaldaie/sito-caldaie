const sharp = require('sharp');
const fs = require('fs');

async function scaleLogo() {
    const src = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\final_user_portrait.png';
    // Center of his logo is around X=512, Y=250.
    // The frame is roughly X=300 to 724, Y=140 to 360.
    
    // We extract the logo + some surrounding background
    console.log("Extracting logo slice");
    const logoBlock = await sharp(src)
        .extract({ left: 280, top: 120, width: 464, height: 260 })
        .toBuffer();
    
    // Scale 1.4x
    const scaledW = Math.round(464 * 1.4); // 649
    const scaledH = Math.round(260 * 1.4); // 364
    console.log(`Scaling ${464}x${260} to ${scaledW}x${scaledH}`);
    
    let scaledLogo = await sharp(logoBlock)
        .resize(scaledW, scaledH)
        .toBuffer();

    // Create an alpha mask to feather the edges
    const svgMask = `
        <svg width="${scaledW}" height="${scaledH}">
            <defs>
                <radialGradient id="fade" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="75%" stop-color="black" stop-opacity="1" />
                    <stop offset="95%" stop-color="black" stop-opacity="0" />
                </radialGradient>
            </defs>
            <rect width="${scaledW}" height="${scaledH}" fill="url(#fade)" />
        </svg>
    `;

    scaledLogo = await sharp(scaledLogo)
        .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
        .png()
        .toBuffer();
        
    // Paste it onto exactly the same center point
    // New center is at scaledW/2, scaledH/2. So we offset top/left by HALF the scaled dimensions
    const destLeft = Math.round(512 - (scaledW / 2));
    const destTop = Math.round(250 - (scaledH / 2));
    
    console.log(`Compositing giant logo at ${destLeft}, ${destTop}`);
    const finalBuffer = await sharp(src)
        .composite([{ input: scaledLogo, left: destLeft, top: destTop }])
        .toBuffer();

    const finalPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\final_user_portrait_big_logo.png';
    await sharp(finalBuffer).toFile(finalPath);
    console.log('Saved to', finalPath);
}

scaleLogo().catch(console.error);
