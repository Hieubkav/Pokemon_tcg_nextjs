const fs = require('fs');
const path = require('path');

const CARDS_DIR = path.join(__dirname, '../public/images/cards/Deluxe Pack ex');
const OUTPUT_FILE = path.join(__dirname, '../../A4B_data.json');
const BACKUP_FILE = path.join(__dirname, '../../A4B_data.json.backup');

function parseCardFilename(filename) {
  const match = filename.match(/^A4B-(\d{3})_(.+)\.webp$/);
  if (!match) return null;

  const [, localId, name] = match;
  return {
    id: `A4B-${localId}`,
    image: `https://assets.tcgdex.net/en/tcgp/A4B/${localId}`,
    localId: localId,
    name: name
  };
}

function generateJSON() {
  console.log('Reading files from:', CARDS_DIR);

  const files = fs.readdirSync(CARDS_DIR);
  const cardFiles = files.filter(f => f.startsWith('A4B-') && f.endsWith('.webp'));

  console.log(`Found ${cardFiles.length} card files`);

  const cards = cardFiles
    .map(parseCardFilename)
    .filter(card => card !== null)
    .sort((a, b) => parseInt(a.localId) - parseInt(b.localId));

  console.log(`Parsed ${cards.length} cards`);

  const existingData = fs.existsSync(OUTPUT_FILE)
    ? JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'))
    : {};

  const newData = {
    id: "A4B",
    name: "Deluxe Pack ex",
    logo: "https://assets.tcgdex.net/en/tcgp/A4B/logo",
    serie: {
      id: "tcgp",
      name: "Pokémon TCG Pocket"
    },
    releaseDate: "2025-08-01",
    legal: {
      standard: false,
      expanded: false
    },
    cards: cards,
    cardCount: {
      total: cards.length,
      official: cards.length,
      normal: 0,
      reverse: 0,
      holo: 0,
      firstEd: 0
    },
    boosters: existingData.boosters || [
      {
        id: "boo_A4B-deluxe",
        name: "Deluxe"
      }
    ]
  };

  if (fs.existsSync(OUTPUT_FILE)) {
    console.log('Creating backup...');
    fs.copyFileSync(OUTPUT_FILE, BACKUP_FILE);
    console.log('Backup created:', BACKUP_FILE);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(newData, null, 2));
  console.log('JSON generated successfully!');
  console.log('Output file:', OUTPUT_FILE);
  console.log(`Total cards: ${cards.length}`);

  console.log('\nFirst 5 cards:');
  cards.slice(0, 5).forEach(card => {
    console.log(`  ${card.id}: ${card.name}`);
  });

  console.log('\nLast 5 cards:');
  cards.slice(-5).forEach(card => {
    console.log(`  ${card.id}: ${card.name}`);
  });
}

try {
  generateJSON();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
