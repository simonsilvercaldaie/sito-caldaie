const sharp = require('sharp');

async function checkBackground() {
    const src = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\final_user_portrait.png';
    const { data } = await sharp(src).extract({ left: 300, top: 120, width: 1, height: 1 }).raw().toBuffer();
    console.log(`Top Left corner of logo bounding box is: RGB(${data[0]}, ${data[1]}, ${data[2]})`);
}
checkBackground().catch(console.error);
