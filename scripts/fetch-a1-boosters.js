const https = require('https');
const fs = require('fs');
const path = require('path');

const SET_ID = 'A1';
const OUTPUT_FILE = path.join(__dirname, '../../A1_data.json');
const BACKUP_FILE = path.join(__dirname, '../../A1_data.json.backup');

async function fetchCardData(cardNumber) {
  const url = `https://raw.githubusercontent.com/tcgdex/cards-database/master/data/Pokémon%20TCG%20Pocket/Genetic%20Apex/${String(cardNumber).padStart(3, '0')}.ts`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        resolve(null);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          // Extract boosters array from TypeScript file
          const boostersMatch = data.match(/boosters:\s*\[([^\]]+)\]/);
          if (boostersMatch) {
            const boostersStr = boostersMatch[1];
            const boosters = boostersStr.match(/["']([^"']+)["']/g)
              ?.map(s => s.replace(/["']/g, '')) || [];
            resolve(boosters);
          } else {
            resolve([]);
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function updateCardsWithBoosters() {
  console.log('Reading existing A1_data.json...');
  const data = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));

  console.log(`Found ${data.cards.length} cards`);

  // Backup original file
  fs.copyFileSync(OUTPUT_FILE, BACKUP_FILE);
  console.log('Created backup');

  let updated = 0;
  let errors = 0;

  for (let i = 0; i < data.cards.length; i++) {
    const card = data.cards[i];
    const cardNum = parseInt(card.localId, 10);

    try {
      const boosters = await fetchCardData(cardNum);
      if (boosters && boosters.length > 0) {
        card.boosters = boosters;
        updated++;
        if (updated % 20 === 0) {
          console.log(`Updated ${updated}/${data.cards.length} cards...`);
        }
      }
    } catch (err) {
      console.error(`Error fetching card ${cardNum}:`, err.message);
      errors++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Save updated data
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

  console.log('\n✓ Done!');
  console.log(`Updated: ${updated} cards`);
  console.log(`Errors: ${errors}`);
  console.log(`Output: ${OUTPUT_FILE}`);

  // Show booster distribution
  const boosterCounts = {};
  data.cards.forEach(card => {
    if (card.boosters && card.boosters.length > 0) {
      card.boosters.forEach(booster => {
        boosterCounts[booster] = (boosterCounts[booster] || 0) + 1;
      });
    }
  });

  console.log('\nBooster distribution:');
  Object.entries(boosterCounts).forEach(([booster, count]) => {
    console.log(`  ${booster}: ${count} cards`);
  });
}

updateCardsWithBoosters().catch(console.error);
