const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const LOGO_URL = 'https://static.deltiasgaming.com/2025/10/2-Pokemon-TCG-Pocket-_-Deluxe-Pack-ex-%E2%9C%A8-YouTube-0-0-10.jpeg';
const TEMP_FILE = path.join(__dirname, 'temp-logo.jpeg');
const OUTPUT_DIR = path.join(__dirname, '../public/images/logos');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'A4B.webp');
const JSON_FILE = path.join(__dirname, '../../A4B_data.json');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log('Downloading logo from:', url);
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
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

async function updateJSON() {
  console.log('Updating JSON file...');
  const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
  data.logo = '/images/logos/A4B.webp';
  fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2));
  console.log('JSON updated successfully!');
}

async function main() {
  try {
    // Create logos directory if not exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log('Created logos directory');
    }

    // Download the image
    await downloadFile(LOGO_URL, TEMP_FILE);

    // Convert to WebP
    await convertToWebp(TEMP_FILE, OUTPUT_FILE);

    // Clean up temp file
    fs.unlinkSync(TEMP_FILE);
    console.log('Cleaned up temporary file');

    // Update JSON
    await updateJSON();

    console.log('\n✓ All done!');
    console.log('Logo saved at:', OUTPUT_FILE);
    console.log('You can now use: /images/logos/A4B.webp');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
