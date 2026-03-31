const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');

async function testPDF() {
    const pdfDoc = await PDFDocument.create();
    const bgBuffer = fs.readFileSync('public/certificate_portrait.png');
    const bgImage = await pdfDoc.embedPng(bgBuffer);
    
    const width = bgImage.width;
    const height = bgImage.height;
    const page = pdfDoc.addPage([width, height]);

    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const navy = rgb(0.1, 0.15, 0.25);
    const gray = rgb(0.3, 0.3, 0.3);
    const parchment = rgb(0.992, 0.984, 0.965);

    page.drawImage(bgImage, { x: 0, y: 0, width, height });

    // 1. Where do we need to mask?
    // In original (1024x1024), Marco Bianchi was roughly Y=500. 
    // Now it's stretched to 1448. The top 500 pixels are on top, so bottom Y is different.
    // Let's just draw the new text and see where it lands, then we can mask underneath it.
    
    page.drawRectangle({
        x: width * 0.15, y: 430, width: width * 0.70, height: 380, color: parchment
    });

    page.drawRectangle({
        x: width * 0.15, y: 190, width: 350, height: 70, color: parchment
    });

    const nameText = 'Simone Caroleo';
    const nameWidth = timesBold.widthOfTextAtSize(nameText, 48);
    page.drawText(nameText, { x: (width - nameWidth) / 2, y: 698, size: 48, font: timesBold, color: navy });

    const ofText = 'dipendente di';
    const ofWidth = timesItalic.widthOfTextAtSize(ofText, 18);
    page.drawText(ofText, { x: (width - ofWidth) / 2, y: 648, size: 18, font: timesItalic, color: gray });

    const compText = 'Simon Silver Assistenza Caldaie di Caroleo Simone';
    const compWidth = timesBold.widthOfTextAtSize(compText, 26);
    page.drawText(compText, { x: (width - compWidth) / 2, y: 598, size: 26, font: timesBold, color: navy });

    page.drawText('CORSO TECNICO...', { x: width/2 - 100, y: 548, size: 22, font: timesBold });
    page.drawText('Data di conseguimento...', { x: 180, y: 224, size: 16, font: timesRoman });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('public/test_cert.pdf', pdfBytes);
    console.log('Test PDF saved to public/test_cert.pdf');
}

testPDF().catch(console.error);
