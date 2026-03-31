const sharp = require('sharp');
sharp('public/certificate_template.png')
  .resize(595, 842, { fit: 'fill' }) // fill ignores aspect ratio and forces exact dimensions
  .toFile('public/certificate_template_a4.png')
  .then(() => console.log('Stretched to A4.'))
  .catch(console.error);
