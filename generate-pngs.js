const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const mappings = [
  { src: 'assets/branding/splash-icon.svg', dest: 'assets/images/splash-icon.png' },
  { src: 'assets/branding/app-icon.svg', dest: 'assets/images/icon.png' },
  { src: 'assets/branding/android-icon-monochrome.svg', dest: 'assets/images/android-icon-monochrome.png' },
  { src: 'assets/branding/android-icon-foreground.svg', dest: 'assets/images/android-icon-foreground.png' },
];

async function generate() {
  for (const { src, dest } of mappings) {
    const srcPath = path.resolve(__dirname, src);
    const destPath = path.resolve(__dirname, dest);
    if (fs.existsSync(srcPath)) {
      console.log(`Converting ${src} to ${dest}...`);
      await sharp(srcPath).png().toFile(destPath);
    } else {
      console.log(`Source not found: ${src}`);
    }
  }
  console.log('Done!');
}

generate().catch(console.error);
