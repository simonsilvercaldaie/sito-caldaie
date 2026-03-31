const sharp = require('sharp');
const fs = require('fs');

async function checkImg() {
    const srcPath = 'C:\\\\Users\\\\simon\\\\.gemini\\\\antigravity\\\\brain\\\\f85c78f2-6ba9-4949-983d-7daff641369e\\\\media__1774883694156.png';
        const { info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
        console.log(`Image Size: ${info.width}x${info.height}`);
}

checkImg().catch(console.error);
