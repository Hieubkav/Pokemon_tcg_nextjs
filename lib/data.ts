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

const DATA_DIR = path.join(process.cwd(), "..");

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
  
  if (setId === "A1") {
    if (num <= 226) return "common";
    if (num <= 250) return "uncommon";
    if (num <= 265) return "rare";
    if (num <= 279) return "double-rare";
    if (num <= 282) return "art-rare";
    if (num <= 283) return "super-rare";
    return "crown";
  }
  
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
  const cardName = useUnderscoreInName.includes(setId) ? card.name.replace(/ /g, "_") : card.name;
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
