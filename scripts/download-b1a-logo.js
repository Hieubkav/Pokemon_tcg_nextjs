const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const LOGO_URL = 'https://archives.bulbagarden.net/media/upload/8/84/B1a_Set_Logo_EN.png';
const TEMP_FILE = path.join(__dirname, 'temp-logo.png');
const OUTPUT_DIR = path.join(__dirname, '../public/images/logos');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'B1A.webp');
const DATA_FILE = path.join(__dirname, '../lib/data.ts');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log('Downloading logo from:', url);
    const file = fs.createWriteStream(dest);

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    https.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('Download completed!');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function convertToWebp(inputPath, outputPath) {
  console.log('Converting to WebP...');
  await sharp(inputPath)
    .webp({ quality: 85 })
    .toFile(outputPath);
  console.log('Conversion completed!');
  console.log('Saved to:', outputPath);
}

async function updateDataFile() {
  console.log('Updating lib/data.ts...');
  let content = fs.readFileSync(DATA_FILE, 'utf-8');

  const oldMapping = `const LOCAL_LOGO_IMAGES: Record<string, string> = {
  "A4B": "/images/logos/A4B.webp",
};`;

  const newMapping = `const LOCAL_LOGO_IMAGES: Record<string, string> = {
  "A4B": "/images/logos/A4B.webp",
  "B1A": "/images/logos/B1A.webp",
};`;

  content = content.replace(oldMapping, newMapping);
  fs.writeFileSync(DATA_FILE, content, 'utf-8');
  console.log('Updated lib/data.ts successfully!');
}

async function main() {
  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    await downloadFile(LOGO_URL, TEMP_FILE);
    await convertToWebp(TEMP_FILE, OUTPUT_FILE);

    fs.unlinkSync(TEMP_FILE);
    console.log('Cleaned up temporary file');

    await updateDataFile();

    console.log('\n✓ All done!');
    console.log('Logo saved at:', OUTPUT_FILE);
    console.log('B1A logo is now available at: /images/logos/B1A.webp');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
