@echo off
echo Converting B1A logo to WebP...
cd /d "%~dp0"
node -e "const sharp = require('sharp'); sharp('B1A-logo.png').webp({quality: 85}).toFile('../public/images/logos/B1A.webp').then(() => console.log('Success!')).catch(err => console.error('Error:', err.message));"
echo.
echo Updating data.ts...
node -e "const fs = require('fs'); let content = fs.readFileSync('../lib/data.ts', 'utf-8'); content = content.replace('\"A4B\": \"/images/logos/A4B.webp\",', '\"A4B\": \"/images/logos/A4B.webp\",\n  \"B1A\": \"/images/logos/B1A.webp\",'); fs.writeFileSync('../lib/data.ts', content, 'utf-8'); console.log('Updated!');"
echo.
echo Done! B1A logo is ready.
pause
