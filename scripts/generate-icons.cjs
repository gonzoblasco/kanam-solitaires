const sharp = require('sharp');

const input = 'public/icons/icon.svg';

async function generate() {
  for (const size of [192, 512]) {
    await sharp(input, { density: 300 }).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
    console.log(`Generated icon-${size}.png`);
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
