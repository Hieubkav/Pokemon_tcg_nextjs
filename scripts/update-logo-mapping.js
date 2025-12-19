const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../lib/data.ts');

let content = fs.readFileSync(dataFilePath, 'utf-8');

// Add LOCAL_LOGO_IMAGES constant before getLocalLogoPath function
const oldCode = `export function getLocalLogoPath(setId: string): string {
  return \`/images/logos/\${setId}.png\`;
}`;

const newCode = `const LOCAL_LOGO_IMAGES: Record<string, string> = {
  "A4B": "/images/logos/A4B.webp",
};

export function getLocalLogoPath(setId: string): string {
  return LOCAL_LOGO_IMAGES[setId] || \`/images/logos/\${setId}.png\`;
}`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(dataFilePath, content, 'utf-8');

console.log('✓ Updated lib/data.ts successfully!');
console.log('✓ A4B logo will now use /images/logos/A4B.webp');
