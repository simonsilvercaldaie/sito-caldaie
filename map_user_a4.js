const sharp = require('sharp');

async function mapRowsUser() {
    const src = 'public/certificate_template_final.png';
    const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });

    let out = '';
    for (let y = 0; y < info.height; y += 10) {
        let minB = 255;
        // Central scan to detect text (avoiding borders)
        for (let x = 200; x < info.width - 200; x++) {
            const idx = (y * info.width + x) * info.channels;
            const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
            if (brightness < minB) minB = brightness;
        }

        // If min brightness is very high (> 245), it's a solid white block!
        // If min brightness is low (< 150), it's text.
        let type = 'grad ';
        if (minB > 250) type = '████W'; // White rectangle
        else if (minB < 150) type = 'TTTTT'; // Dark text
        
        out += `Y=${y.toString().padStart(4, '0')} : ${type} (min: ${Math.round(minB)})\n`;
    }
    
    require('fs').writeFileSync('public/row_map_user.txt', out);
    console.log('Done mapping.');
}

mapRowsUser().catch(console.error);
