import path from "path";
import fs from "fs";

export interface Card {
  id: string;
  image: string;
  localId: string;
  name: string;
  rarity?: "common" | "uncommon" | "rare" | "double-rare" | "art-rare" | "super-rare" | "immersive" | "crown";
  boosters?: string[];
}

export interface Booster {
  id: string;
  name: string;
}

export interface CardSet {
  id: string;
  name: string;
  logo: string;
  symbol: string;
  releaseDate: string;
  cards: Card[];
  boosters: Booster[];
  cardCount: {
    total: number;
    official: number;
  };
}

const DATA_DIR = path.join(process.cwd(), "data");

const SET_FILES: Record<string, { file: string; folder: string }> = {
  A1: { file: "A1_data.json", folder: "Genetic Apex" },
  A1a: { file: "A1a_data.json", folder: "Mythical Island" },
  A2: { file: "A2_data.json", folder: "Space-Time Smackdown" },
  A2a: { file: "A2a_data.json", folder: "Triumphant Light" },
  A2b: { file: "A2b_data.json", folder: "Shining Revelry" },
  A3: { file: "A3_data.json", folder: "Celestial Guardians" },
  A3a: { file: "A3a_data.json", folder: "Extradimensional Crisis" },
  A3b: { file: "A3b_data.json", folder: "Eevee Grove" },
  A4: { file: "A4_data.json", folder: "Wisdom of Sea and Sky" },
  A4a: { file: "A4a_data.json", folder: "Secluded Springs" },
  A4B: { file: "A4B_data.json", folder: "Deluxe Pack ex" },
  B1: { file: "B1_data.json", folder: "Mega Rising" },
  B1A: { file: "B1A_data.json", folder: "Crimson Blaze" },
  "P-A": { file: "P-A_data.json", folder: "Promos-A" },
  "P-B": { file: "P-B_data.json", folder: "Promos-B" },
};

export const BOOSTER_IMAGES: Record<string, string> = {
  "charizard": "/images/packs/charizard.webp",
  "mewtwo": "/images/packs/mewtwo.webp",
  "pikachu": "/images/packs/pikachu.webp",
  "solgaleo": "/images/packs/solgaleo.webp",
  "lunala": "/images/packs/lunala.webp",
  "mew": "/images/packs/mew.png",
  "dialga": "/images/packs/dialga.png",
  "palkia": "/images/packs/palkia.png",
  "lugia": "/images/packs/lugia.webp",
  "ho-oh": "/images/packs/ho-oh.webp",
  "mega gyarados": "/images/packs/mega-gyarados.webp",
  "mega blaziken": "/images/packs/mega-blaziken.webp",
  "mega altaria": "/images/packs/mega-altaria.webp",
  "vol. 1": "/images/packs/promo-a-vol1.webp",
  "vol. 2": "/images/packs/promo-a-vol2.webp",
  "vol. 3": "/images/packs/promo-a-vol3.webp",
  "vol. 4": "/images/packs/promo-a-vol4.webp",
  "vol. 5": "/images/packs/promo-a-vol5.webp",
  "vol. 6": "/images/packs/promo-a-vol6.webp",
  "vol. 7": "/images/packs/promo-a-vol7.webp",
  "vol. 8": "/images/packs/promo-a-vol8.webp",
  "vol. 9": "/images/packs/promo-a-vol9.webp",
  "vol. 10": "/images/packs/promo-a-vol10.webp",
  "vol. 11": "/images/packs/promo-a-vol11.webp",
};

const LOCAL_LOGO_IMAGES: Record<string, string> = {
  "A4": "/images/logos/A4.webp",
  "A4B": "/images/logos/A4B.webp",
  "B1A": "/images/logos/B1A.webp",
  "P-A": "/images/logos/P-A.webp",
  "P-B": "/images/logos/P-B.webp",
};

export function getLocalLogoPath(setId: string): string {
  return LOCAL_LOGO_IMAGES[setId] || `/images/logos/${setId}.png`;
}

const LOCAL_PACK_IMAGES: Record<string, string> = {
  "A2a": "/images/packs/A2a.webp",
  "A2b": "/images/packs/A2b.webp",
  "A3a": "/images/packs/A3a.webp",
  "A3b": "/images/packs/A3b.webp",
  "A4a": "/images/packs/A4a.webp",
  "A4B": "/images/packs/A4B.webp",
  "B1A": "/images/packs/B1A.webp",
};

export function getLocalPackImage(setId: string): string | null {
  return LOCAL_PACK_IMAGES[setId] || null;
}

function getRarityFromId(localId: string, setId: string): Card["rarity"] {
  const num = parseInt(localId, 10);
  
  // Genetic Apex (A1) - 286 cards
  if (setId === "A1") {
    if (num <= 178) return "common";
    if (num <= 207) return "uncommon";
    if (num <= 226) return "rare";
    if (num <= 253) return "double-rare";
    if (num <= 271) return "art-rare";
    if (num <= 283) return "super-rare";
    if (num <= 285) return "immersive";
    return "crown";
  }
  
  // Mythical Island (A1a) - 86 cards
  if (setId === "A1a") {
    if (num <= 52) return "common";
    if (num <= 62) return "uncommon";
    if (num <= 68) return "rare";
    if (num <= 77) return "double-rare";
    if (num <= 82) return "art-rare";
    if (num <= 84) return "super-rare";
    if (num <= 85) return "immersive";
    return "crown";
  }
  
  // Space-Time Smackdown (A2) - 207 cards, official 140
  // 001-096: Common, 097-120: Uncommon, 121-135: Rare
  // 136-150: Double-rare (EX), 151-157: Art-rare, 158-162: Super-rare
  // 163-179: Common/Uncommon extras
  // 180-189: Double-rare (EX), 190-195: Art-rare (Supporters)
  // 196-205: Super-rare (Full art EX), 206-207: Crown
  if (setId === "A2") {
    if (num >= 206) return "crown";
    if (num >= 196 && num <= 205) return "super-rare";
    if (num >= 190 && num <= 195) return "art-rare";
    if (num >= 180 && num <= 189) return "double-rare";
    if (num >= 163 && num <= 179) return "common";
    if (num <= 96) return "common";
    if (num <= 120) return "uncommon";
    if (num <= 135) return "rare";
    if (num <= 150) return "double-rare";
    if (num <= 157) return "art-rare";
    if (num <= 162) return "super-rare";
    return "common";
  }
  
  // Triumphant Light (A2a) - 96 cards
  if (setId === "A2a") {
    if (num <= 56) return "common";
    if (num <= 68) return "uncommon";
    if (num <= 75) return "rare";
    if (num <= 84) return "double-rare";
    if (num <= 91) return "art-rare";
    if (num <= 94) return "super-rare";
    if (num <= 95) return "immersive";
    return "crown";
  }
  
  // Shining Revelry (A2b) - 111 cards, includes shiny cards
  // Shiny 1-star mapped to art-rare, Shiny 2-star mapped to super-rare
  if (setId === "A2b") {
    if (num <= 44) return "common";
    if (num <= 57) return "uncommon";
    if (num <= 68) return "rare";
    if (num <= 78) return "double-rare";
    if (num <= 87) return "art-rare";      // Full art + Shiny 1-star (097-106)
    if (num <= 96) return "super-rare";    // Full art EX
    if (num <= 106) return "art-rare";     // Shiny 1-star (mapped to art-rare rates)
    if (num <= 110) return "super-rare";   // Shiny 2-star (mapped to super-rare rates)
    return "crown";
  }
  
  // Celestial Guardians (A3) - 239 cards, official 155
  // 001-100: Common, 101-125: Uncommon, 126-140: Rare
  // 141-155: Double-rare (EX), 156-165: Art-rare, 166-172: Super-rare, 173-174: Immersive
  // 175-179: Common extras
  // 180-189: Double-rare (EX), 190-197: Art-rare (Supporters)
  // 198-209: Super-rare (Full art EX)
  // 210-229: Art-rare (Shiny pokemon)
  // 230-237: Super-rare (Shiny EX), 238-239: Crown
  if (setId === "A3") {
    if (num >= 238) return "crown";
    if (num >= 230 && num <= 237) return "super-rare";
    if (num >= 210 && num <= 229) return "art-rare";
    if (num >= 198 && num <= 209) return "super-rare";
    if (num >= 190 && num <= 197) return "art-rare";
    if (num >= 180 && num <= 189) return "double-rare";
    if (num >= 175 && num <= 179) return "common";
    if (num <= 100) return "common";
    if (num <= 125) return "uncommon";
    if (num <= 140) return "rare";
    if (num <= 155) return "double-rare";
    if (num <= 165) return "art-rare";
    if (num <= 172) return "super-rare";
    if (num <= 174) return "immersive";
    return "common";
  }
  
  // Wisdom of Sea and Sky (A4) - 241 cards, official 161
  if (setId === "A4") {
    if (num <= 100) return "common";
    if (num <= 130) return "uncommon";
    if (num <= 161) return "rare";
    if (num <= 190) return "double-rare";
    if (num <= 215) return "art-rare";
    if (num <= 235) return "super-rare";
    if (num <= 239) return "immersive";
    return "crown";
  }
  
  // Mini sets (A3a, A3b, A4a) - similar to A2a
  if (setId === "A3a" || setId === "A3b" || setId === "A4a") {
    if (num <= 55) return "common";
    if (num <= 67) return "uncommon";
    if (num <= 75) return "rare";
    if (num <= 84) return "double-rare";
    if (num <= 90) return "art-rare";
    if (num <= 94) return "super-rare";
    if (num <= 95) return "immersive";
    return "crown";
  }
  
  // Deluxe Pack ex (A4B) - reprints with EX cards scattered throughout
  // Rarity is determined by card name in getSet function, not by ID
  if (setId === "A4B") {
    return undefined as unknown as Card["rarity"];
  }
  
  // Mega Rising (B1) - 331 cards, official 226
  // B1 has EX cards scattered throughout (001-226), special cards from 227+
  // Based on Serebii/Limitless TCG data:
  // - 001-226: Base set (commons, uncommons, rares + EX cards mixed in)
  // - 227-250: Art rare (☆) - illustration versions
  // - 251-271: Super rare (☆☆) - full art versions
  // - 272-286: Super rare (☆☆) - rainbow/special illustrations
  // - 287-316: Art rare (shiny ☆) - shiny Pokemon
  // - 317-328: Super rare (shiny ☆☆) - shiny EX Pokemon
  // - 329-331: Crown rare (👑)
  if (setId === "B1") {
    if (num >= 329) return "crown";
    if (num >= 317 && num <= 328) return "super-rare"; // shiny EX
    if (num >= 287 && num <= 316) return "art-rare"; // shiny
    if (num >= 251 && num <= 286) return "super-rare"; // full art + rainbow
    if (num >= 227 && num <= 250) return "art-rare"; // illustration rare
    // For base cards (001-226), return null to trigger name-based detection
    return undefined as unknown as Card["rarity"];
  }
  
  // Crimson Blaze (B1A) - mini set, 103 cards
  if (setId === "B1A") {
    if (num <= 44) return "common";
    if (num <= 57) return "uncommon";
    if (num <= 65) return "rare";
    if (num <= 69) return "double-rare";
    if (num <= 75) return "art-rare";
    if (num <= 82) return "super-rare";
    if (num <= 87) return "immersive";
    if (num <= 97) return "art-rare";     // Shiny 1-star
    if (num <= 102) return "super-rare";  // Shiny 2-star
    return "crown";
  }
  
  // Promo packs - usually all cards are art-rare or higher
  if (setId === "P-A" || setId === "P-B") {
    return "art-rare";
  }
  
  // Default fallback for unknown sets
  if (num <= 150) return "common";
  if (num <= 200) return "uncommon";
  if (num <= 230) return "rare";
  if (num <= 260) return "double-rare";
  if (num <= 280) return "art-rare";
  return "super-rare";
}

// B1 Mega Rising - Uncommon cards (◊◊) based on Limitless TCG data
const B1_UNCOMMON_IDS = new Set([
  "009", "012", "024", "026", "029", "034", "040", "042", "047", "054",
  "059", "065", "066", "072", "075", "077", "079", "083", "087", "091",
  "093", "096", "098", "100", "104", "108", "113", "116", "118", "123",
  "127", "129", "131", "133", "140", "142", "144", "146", "150", "153",
  "156", "162", "164", "167", "171", "178", "182", "186", "189", "200",
  "202", "205", "206", "207", "208", "210", "212", "213", "215", "217",
  "218", "219", "220", "221", "222", "223", "224", "225", "226"
]);

// B1 Mega Rising - Rare cards (◊◊◊) based on Limitless TCG data
const B1_RARE_IDS = new Set([
  "005", "007", "010", "018", "020", "027", "032", "035", "043", "046",
  "051", "055", "057", "067", "069", "070", "080", "084", "088", "105",
  "106", "109", "111", "114", "120", "132", "134", "136", "137", "147",
  "149", "154", "157", "158", "165", "168", "169", "172", "175", "179",
  "187", "192", "194", "197", "203", "214", "216"
]);

// B1 Mega Rising - Double-rare/EX cards (◊◊◊◊) based on Limitless TCG data
const B1_DOUBLE_RARE_IDS = new Set([
  "002", "016", "031", "036", "052", "073", "081", "085", "102", "121",
  "124", "151", "160", "174", "183"
]);

// Detect rarity from card data for B1 set (mixed structure)
// Based on Limitless TCG official rarity data
function getRarityFromB1Data(localId: string): Card["rarity"] {
  if (B1_DOUBLE_RARE_IDS.has(localId)) return "double-rare";
  if (B1_RARE_IDS.has(localId)) return "rare";
  if (B1_UNCOMMON_IDS.has(localId)) return "uncommon";
  return "common";
}

// Detect rarity for A4B (Deluxe Pack ex) based on Serebii data
// Cards 354-379 are secret rares that appear in Slot 3
function getRarityFromA4B(localId: string, name: string): Card["rarity"] {
  const num = parseInt(localId, 10);
  
  // Secret rare cards (354-379) - appear in Slot 3
  if (num === 379) return "crown";           // Crown Rare Candy
  if (num === 376) return "immersive";       // 3-star Pikachu ex
  if (num >= 377 && num <= 378) return "super-rare"; // Shiny 2-star (Giratina, Darkrai)
  if (num >= 354 && num <= 375) return "super-rare"; // 2-star cards
  
  // Regular cards (001-353)
  const lowerName = name.toLowerCase();
  
  // EX cards (4◇) - appear ONLY in Slot 4
  if (lowerName.includes(" ex")) return "double-rare";
  
  // 3◇ rare cards (evolved Pokemon without ex)
  const rareNames = ["jumpluff", "serperior", "shaymin", "typhlosion", "feraligatr", 
    "meganium", "arcanine", "ninetales", "gyarados", "starmie", "lapras", "vaporeon",
    "jolteon", "flareon", "espeon", "umbreon", "leafeon", "glaceon", "sylveon",
    "raichu", "electrode", "magnezone", "electivire", "luxray", "gengar", "alakazam",
    "gardevoir", "gallade", "metagross", "aggron", "machamp", "golem", "rhyperior",
    "mamoswine", "weavile", "honchkrow", "mismagius", "dusknoir", "chandelure",
    "hydreigon", "dragonite", "salamence", "garchomp", "togekiss", "blissey"];
  if (rareNames.some(r => lowerName.includes(r))) return "rare";
  
  // 2◇ uncommon (stage 1 and some trainers)
  const uncommonPatterns = ["ivysaur", "charmeleon", "wartortle", "kakuna", "metapod",
    "pidgeotto", "raticate", "fearow", "arbok", "pikachu", "sandslash", "nidorina",
    "nidorino", "clefable", "wigglytuff", "golbat", "gloom", "parasect", "venomoth",
    "dugtrio", "persian", "golduck", "primeape", "growlithe", "poliwhirl", "kadabra",
    "machoke", "weepinbell", "tentacruel", "graveler", "ponyta", "slowbro", "magneton",
    "dodrio", "dewgong", "muk", "cloyster", "haunter", "hypno", "kingler", "electrode",
    "exeggutor", "marowak", "hitmon", "lickitung", "weezing", "rhydon", "chansey",
    "tangela", "seadra", "seaking", "staryu", "mr. mime", "jynx", "electabuzz",
    "magmar", "pinsir", "tauros", "magikarp", "ditto", "eevee", "porygon", "omanyte",
    "kabuto", "aerodactyl", "snorlax", "professor", "potion", "ball", "switch",
    "candy", "energy", "skiploom", "servine", "dartrix", "croconaw", "quilava",
    "bayleef", "cherrim", "pheromosa"];
  if (uncommonPatterns.some(p => lowerName.includes(p))) return "uncommon";
  
  // Default to 1◇ common (basic Pokemon)
  return "common";
}

export async function getSet(setId: string): Promise<CardSet | null> {
  const setConfig = SET_FILES[setId];
  if (!setConfig) return null;

  try {
    const filePath = path.join(DATA_DIR, setConfig.file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    const cards = data.cards.map((card: Card) => {
      let rarity = getRarityFromId(card.localId, setId);
      
      // For B1 base cards (001-226), use Limitless TCG rarity data
      if (!rarity && setId === "B1") {
        rarity = getRarityFromB1Data(card.localId);
      }
      
      // For A4B, detect rarity from ID and card name (based on Serebii data)
      if (!rarity && setId === "A4B") {
        rarity = getRarityFromA4B(card.localId, card.name);
      }
      
      return {
        ...card,
        rarity: rarity || "common",
      };
    });

    return {
      ...data,
      cards,
    };
  } catch {
    return null;
  }
}

export async function getAllSets(): Promise<CardSet[]> {
  const regularSets: CardSet[] = [];
  const promoSets: CardSet[] = [];
  
  for (const setId of Object.keys(SET_FILES)) {
    const set = await getSet(setId);
    if (set) {
      if (setId.startsWith("P-")) {
        promoSets.push(set);
      } else {
        regularSets.push(set);
      }
    }
  }
  
  // Reverse regular sets, keep promos at the end
  return [...regularSets.reverse(), ...promoSets];
}

export function getLocalImagePath(setId: string, card: Card): string {
  const setConfig = SET_FILES[setId];
  if (!setConfig) return card.image;
  
  const prefixMap: Record<string, string> = {
    "B1A": "B1A-",
    "A4B": "A4B-",
    "P-B": "PROMO-B-",
  };
  
  const useUnderscoreInName = ["B1A"];
  
  const prefix = prefixMap[setId] || "";
  let cardName = card.name;
  
  // Handle special characters in card names
  cardName = cardName.replace(/:/g, "_"); // Type: Null -> Type_ Null
  cardName = cardName.replace(/'/g, "_"); // Apostrophes to underscores for filenames
  
  if (useUnderscoreInName.includes(setId)) {
    cardName = cardName.replace(/ /g, "_");
  }
  
  return `/images/cards/${setConfig.folder}/${prefix}${card.localId}_${cardName}.webp`;
}

export function openPack(cards: Card[], packSize: number = 5): Card[] {
  const commonCards = cards.filter(c => c.rarity === "common");
  const uncommonCards = cards.filter(c => c.rarity === "uncommon");
  const rareCards = cards.filter(c => c.rarity === "rare");
  const doubleRareCards = cards.filter(c => c.rarity === "double-rare");
  const artRareCards = cards.filter(c => c.rarity === "art-rare");
  const superRareCards = cards.filter(c => c.rarity === "super-rare");
  const immersiveCards = cards.filter(c => c.rarity === "immersive");
  const crownCards = cards.filter(c => c.rarity === "crown");

  const pack: Card[] = [];
  
  // 0.05% chance for Rare Pack (all cards are Star rarity or higher)
  const isRarePack = Math.random() < 0.0005;
  
  if (isRarePack) {
    const rarePoolCards = [...artRareCards, ...superRareCards, ...immersiveCards, ...crownCards];
    if (rarePoolCards.length > 0) {
      for (let i = 0; i < packSize; i++) {
        pack.push(rarePoolCards[Math.floor(Math.random() * rarePoolCards.length)]);
      }
      return pack;
    }
  }

  // Slot 1-3: Almost always Common (based on Serebii ~2.04% per common card in slot 1-3)
  // Aggregate: ~99.5% Common, ~0.4% Uncommon, ~0.1% Rare
  for (let i = 0; i < 3; i++) {
    const roll = Math.random();
    if (roll < 0.995 && commonCards.length > 0) {
      pack.push(commonCards[Math.floor(Math.random() * commonCards.length)]);
    } else if (roll < 0.999 && uncommonCards.length > 0) {
      pack.push(uncommonCards[Math.floor(Math.random() * uncommonCards.length)]);
    } else if (rareCards.length > 0) {
      pack.push(rareCards[Math.floor(Math.random() * rareCards.length)]);
    } else if (commonCards.length > 0) {
      pack.push(commonCards[Math.floor(Math.random() * commonCards.length)]);
    }
  }
  
  // Slot 4: Higher chance for Uncommon/Rare (based on Serebii slot 4 rates)
  // Aggregate: ~90% Common, ~7% Uncommon, ~2.5% Rare, ~0.5% Higher
  const roll4 = Math.random();
  if (roll4 < 0.90 && commonCards.length > 0) {
    pack.push(commonCards[Math.floor(Math.random() * commonCards.length)]);
  } else if (roll4 < 0.97 && uncommonCards.length > 0) {
    pack.push(uncommonCards[Math.floor(Math.random() * uncommonCards.length)]);
  } else if (roll4 < 0.995 && rareCards.length > 0) {
    pack.push(rareCards[Math.floor(Math.random() * rareCards.length)]);
  } else if (roll4 < 0.9995 && doubleRareCards.length > 0) {
    pack.push(doubleRareCards[Math.floor(Math.random() * doubleRareCards.length)]);
  } else if (superRareCards.length > 0) {
    pack.push(superRareCards[Math.floor(Math.random() * superRareCards.length)]);
  } else if (commonCards.length > 0) {
    pack.push(commonCards[Math.floor(Math.random() * commonCards.length)]);
  }
  
  // Slot 5: Main rare slot (based on Serebii official rates)
  // Crown: 0.16%, Immersive: 0.16%, Super Rare: 4.222%, Art Rare: 3.846%
  // Double Rare: 5%, Rare: 6.66%, Uncommon: 20.56%, Common: 57.82%
  const roll5 = Math.random();
  if (roll5 < 0.0016 && crownCards.length > 0) {
    pack.push(crownCards[Math.floor(Math.random() * crownCards.length)]);
  } else if (roll5 < 0.0032 && immersiveCards.length > 0) {
    pack.push(immersiveCards[Math.floor(Math.random() * immersiveCards.length)]);
  } else if (roll5 < 0.0454 && superRareCards.length > 0) {
    pack.push(superRareCards[Math.floor(Math.random() * superRareCards.length)]);
  } else if (roll5 < 0.0839 && artRareCards.length > 0) {
    pack.push(artRareCards[Math.floor(Math.random() * artRareCards.length)]);
  } else if (roll5 < 0.1339 && doubleRareCards.length > 0) {
    pack.push(doubleRareCards[Math.floor(Math.random() * doubleRareCards.length)]);
  } else if (roll5 < 0.2005 && rareCards.length > 0) {
    pack.push(rareCards[Math.floor(Math.random() * rareCards.length)]);
  } else if (roll5 < 0.4061 && uncommonCards.length > 0) {
    pack.push(uncommonCards[Math.floor(Math.random() * uncommonCards.length)]);
  } else if (commonCards.length > 0) {
    pack.push(commonCards[Math.floor(Math.random() * commonCards.length)]);
  } else if (uncommonCards.length > 0) {
    pack.push(uncommonCards[Math.floor(Math.random() * uncommonCards.length)]);
  }

  return pack.slice(0, packSize);
}

export function getSetFolderName(setId: string): string {
  return SET_FILES[setId]?.folder || "";
}
