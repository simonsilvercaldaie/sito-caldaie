const sharp = require('sharp');
sharp('public/certificate_template.png').metadata().then(m => {
  console.log('Width:', m.width);
  console.log('Height:', m.height);
});
