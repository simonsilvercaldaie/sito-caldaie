const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:\\Users\\simon\\.gemini\\antigravity\\brain\\f85c78f2-6ba9-4949-983d-7daff641369e\\certificate_mockup_1774856421089.png';
const outputPath = path.join(__dirname, 'public', 'cert_bg.jpg');

async function processImage() {
    // We want to overlay a rectangle over the text areas.
    // The background is a very slight off-white #F8F7F3 approx.
    // Let's create an SVG overlay to blot out the text.
    // We will erase:
    // 1. "Marco Bianchi" 
    // 2. "Termoidraulica Rossi S.r.l."
    // 3. The course name texts below it
    // 4. The date "30 Marzo 2026"
    // 5. The "www.simonsilvercaldaie.it"
    // Leave the logo, "CERTIFICATO DI COMPLETAMENTO", "Si certifica che", the flame icons, and the signature "Simon Silver".
    
    // The image size is likely 1024x1024, but let's read metadata.
    const metadata = await sharp(inputPath).metadata();
    const w = metadata.width;
    const h = metadata.height;

    // Based on standard SD aspect ratio, let's just create a solid box 
    // that covers everything from Y=45% to Y=85% down the center, and a box for date, website.
    // Actually, letting me blur a clean slice of the background to get the exact color/texture is better.
    // We take a slice of the left margin background.
    
    const bgSlice = await sharp(inputPath)
        .extract({ left: Math.floor(w * 0.1), top: Math.floor(h * 0.5), width: 50, height: 50 })
        .toBuffer();

    // Now we resize this slice to cover the text areas!
    const textCover = await sharp(bgSlice)
        .resize({ width: Math.floor(w * 0.8), height: Math.floor(h * 0.45) })
        .blur(10) // Blur to smooth
        .toBuffer();

    // Now composite the text cover securely over the text zone!
    // The text starts below the first flame.
    // Marco Bianchi is around y=350 to y=450 on a 1024 image.
    // We'll cover from Marco Bianchi down to just above the signature.
    
    await sharp(inputPath)
        .composite([
            {
                input: textCover,
                top: Math.floor(h * 0.50), // Covers from halfway down Marco Bianchi
                left: Math.floor(w * 0.1),
                blend: 'over'
            }
        ])
        .jpeg({ quality: 90 })
        .toFile(outputPath);
        
    console.log("Processed background saved to", outputPath);
}

processImage().catch(console.error);
