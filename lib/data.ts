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
  
  // Space-Time Smackdown (A2) - 163 cards
  if (setId === "A2") {
    if (num <= 96) return "common";
    if (num <= 120) return "uncommon";
    if (num <= 135) return "rare";
    if (num <= 150) return "double-rare";
    if (num <= 157) return "art-rare";
    if (num <= 161) return "super-rare";
    if (num <= 162) return "immersive";
    return "crown";
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
  
  // Celestial Guardians (A3) - similar structure
  if (setId === "A3") {
    if (num <= 100) return "common";
    if (num <= 125) return "uncommon";
    if (num <= 140) return "rare";
    if (num <= 155) return "double-rare";
    if (num <= 165) return "art-rare";
    if (num <= 172) return "super-rare";
    if (num <= 174) return "immersive";
    return "crown";
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
  
  // Deluxe Pack ex (A4B) - reprints with guaranteed EX
  // Most cards are double-rare or higher
  if (setId === "A4B") {
    if (num <= 200) return "common";
    if (num <= 280) return "uncommon";
    if (num <= 320) return "rare";
    if (num <= 353) return "double-rare";
    if (num <= 365) return "art-rare";
    if (num <= 375) return "super-rare";
    return "crown";
  }
  
  // Mega Rising (B1) - new mega evolution set
  if (setId === "B1") {
    if (num <= 100) return "common";
    if (num <= 130) return "uncommon";
    if (num <= 150) return "rare";
    if (num <= 170) return "double-rare";
    if (num <= 185) return "art-rare";
    if (num <= 195) return "super-rare";
    if (num <= 198) return "immersive";
    return "crown";
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

export async function getSet(setId: string): Promise<CardSet | null> {
  const setConfig = SET_FILES[setId];
  if (!setConfig) return null;

  try {
    const filePath = path.join(DATA_DIR, setConfig.file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    const cards = data.cards.map((card: Card) => ({
      ...card,
      rarity: getRarityFromId(card.localId, setId),
    }));

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
  const crownCards = cards.filter(c => c.rarity === "crown");

  const pack: Card[] = [];
  
  // First 3 cards: common
  for (let i = 0; i < 3; i++) {
    if (commonCards.length > 0) {
      pack.push(commonCards[Math.floor(Math.random() * commonCards.length)]);
    }
  }
  
  // 4th card: uncommon or better
  const roll4 = Math.random();
  if (roll4 < 0.7 && uncommonCards.length > 0) {
    pack.push(uncommonCards[Math.floor(Math.random() * uncommonCards.length)]);
  } else if (roll4 < 0.9 && rareCards.length > 0) {
    pack.push(rareCards[Math.floor(Math.random() * rareCards.length)]);
  } else if (doubleRareCards.length > 0) {
    pack.push(doubleRareCards[Math.floor(Math.random() * doubleRareCards.length)]);
  } else if (uncommonCards.length > 0) {
    pack.push(uncommonCards[Math.floor(Math.random() * uncommonCards.length)]);
  }
  
  // 5th card: rare slot with chance for ultra rare
  const roll5 = Math.random();
  if (roll5 < 0.005 && crownCards.length > 0) {
    pack.push(crownCards[Math.floor(Math.random() * crownCards.length)]);
  } else if (roll5 < 0.02 && superRareCards.length > 0) {
    pack.push(superRareCards[Math.floor(Math.random() * superRareCards.length)]);
  } else if (roll5 < 0.05 && artRareCards.length > 0) {
    pack.push(artRareCards[Math.floor(Math.random() * artRareCards.length)]);
  } else if (roll5 < 0.15 && doubleRareCards.length > 0) {
    pack.push(doubleRareCards[Math.floor(Math.random() * doubleRareCards.length)]);
  } else if (roll5 < 0.5 && rareCards.length > 0) {
    pack.push(rareCards[Math.floor(Math.random() * rareCards.length)]);
  } else if (uncommonCards.length > 0) {
    pack.push(uncommonCards[Math.floor(Math.random() * uncommonCards.length)]);
  }

  return pack.slice(0, packSize);
}

export function getSetFolderName(setId: string): string {
  return SET_FILES[setId]?.folder || "";
}
