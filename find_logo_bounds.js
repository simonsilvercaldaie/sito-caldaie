const sharp = require('sharp');

async function extractLogo() {
    const src = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\final_user_portrait.png';
    // Let's guess the logo is around X=300, Y=150, W=424, H=220
    await sharp(src)
        .extract({ left: 300, top: 120, width: 424, height: 260 })
        .toFile('public/logo_test_crop.png');
    console.log("Extracted test logo");
}

extractLogo().catch(console.error);
