"use client";

import type { Card } from "./data";

// Pull rates based on official Pokemon TCG Pocket rates
// Source: Serebii, Game8, Shacknews
// Standard Pack (5 cards):
// Slot 1-3: Common (1◇) - 100%
// Slot 4: Uncommon (2◇) ~90%, Rare (3◇) ~10%
// Slot 5: Variable with higher rare chances
const SLOT4_RATES = {
  uncommon: 0.90,  // 90%
  rare: 1.0,       // 10% (remaining)
};

// Slot 5 rates (cumulative thresholds)
// Based on actual game data: most packs give uncommon/rare
const SLOT5_RATES = {
  crown: 0.0004,     // 0.04% - Crown rare
  immersive: 0.0026, // 0.22% - Immersive/3-star
  superRare: 0.0076, // 0.5% - Super rare/2-star  
  artRare: 0.0333,   // 2.57% - Art rare/1-star
  doubleRare: 0.05,  // 1.67% - EX/4-diamond
  rare: 0.10,        // 5% - Rare/3-diamond
  uncommon: 1.0,     // 90% - Uncommon (remaining)
};

// Deluxe Pack ex (A4B) - 4 cards, guaranteed 1 EX (4◇+) at slot 4
// Source: Game8, Serebii - guaranteed EX but still rare for higher
const DELUXE_SLOT4_RATES = {
  crown: 0.001,      // 0.1% - Crown very rare even in deluxe
  immersive: 0.005,  // 0.4% - Immersive
  superRare: 0.02,   // 1.5% - Super rare
  artRare: 0.08,     // 6% - Art rare
  doubleRare: 1.0,   // 92% - guaranteed EX minimum
};

// God pack chance: 0.05% (1 in 2000 packs)
const GOD_PACK_CHANCE = 0.0005;

function pickRandom<T>(arr: T[]): T | undefined {
  return arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}

export function openPackClient(
  cards: Card[],
  packSize: number = 5,
  booster?: string,
  setId?: string
): Card[] {
  // Filter cards by booster if specified (case-insensitive)
  let availableCards = cards;
  if (booster) {
    const boosterLower = booster.toLowerCase();
    availableCards = cards.filter(c => {
      return c.boosters && c.boosters.some(b => b.toLowerCase() === boosterLower);
    });
  }

  const commonCards = availableCards.filter(c => c.rarity === "common");
  const uncommonCards = availableCards.filter(c => c.rarity === "uncommon");
  const rareCards = availableCards.filter(c => c.rarity === "rare");
  const doubleRareCards = availableCards.filter(c => c.rarity === "double-rare");
  const artRareCards = availableCards.filter(c => c.rarity === "art-rare");
  const superRareCards = availableCards.filter(c => c.rarity === "super-rare");
  const immersiveCards = availableCards.filter(c => c.rarity === "immersive");
  const crownCards = availableCards.filter(c => c.rarity === "crown");

  // All rare+ cards for god pack
  const rareOrBetterCards = [
    ...artRareCards,
    ...superRareCards,
    ...immersiveCards,
    ...crownCards,
  ];

  const pack: Card[] = [];
  
  // Special handling for Deluxe Pack ex (A4B) - 4 cards, guaranteed EX at slot 4
  if (setId === "A4B") {
    return openDeluxePack(
      commonCards, uncommonCards, rareCards, doubleRareCards,
      artRareCards, superRareCards, immersiveCards, crownCards,
      packSize
    );
  }

  // Check for God Pack (0.05% chance) - all cards are 1-star or higher
  if (Math.random() < GOD_PACK_CHANCE && rareOrBetterCards.length >= packSize) {
    for (let i = 0; i < packSize; i++) {
      const card = pickRandom(rareOrBetterCards);
      if (card) pack.push(card);
    }
    return pack;
  }

  // Slot 1-3: Common cards (1◇) - 100% guaranteed
  const commonSlots = Math.min(3, packSize);
  for (let i = 0; i < commonSlots; i++) {
    const card = pickRandom(commonCards);
    if (card) pack.push(card);
  }
  
  // Slot 4: Uncommon (95%) or Rare (5%)
  if (packSize >= 4) {
    const roll4 = Math.random();
    let card: Card | undefined;
    
    if (roll4 < SLOT4_RATES.uncommon) {
      card = pickRandom(uncommonCards);
    } else {
      card = pickRandom(rareCards);
    }
    
    // Fallback chain
    if (!card) card = pickRandom(uncommonCards) || pickRandom(commonCards);
    if (card) pack.push(card);
  }
  
  // Slot 5: Variable rarity (best slot)
  if (packSize >= 5) {
    const roll5 = Math.random();
    let card: Card | undefined;
    
    if (roll5 < SLOT5_RATES.crown) {
      card = pickRandom(crownCards);
    } else if (roll5 < SLOT5_RATES.immersive) {
      card = pickRandom(immersiveCards);
    } else if (roll5 < SLOT5_RATES.superRare) {
      card = pickRandom(superRareCards);
    } else if (roll5 < SLOT5_RATES.artRare) {
      card = pickRandom(artRareCards);
    } else if (roll5 < SLOT5_RATES.doubleRare) {
      card = pickRandom(doubleRareCards);
    } else if (roll5 < SLOT5_RATES.rare) {
      card = pickRandom(rareCards);
    } else {
      card = pickRandom(uncommonCards);
    }
    
    // Fallback chain for slot 5
    if (!card) {
      card = pickRandom(uncommonCards) || 
             pickRandom(rareCards) || 
             pickRandom(doubleRareCards) ||
             pickRandom(commonCards);
    }
    if (card) pack.push(card);
  }

  // Fill remaining slots if needed (for special packs)
  while (pack.length < packSize) {
    const fallbackCard = pickRandom(uncommonCards) || pickRandom(commonCards);
    if (fallbackCard) {
      pack.push(fallbackCard);
    } else {
      break;
    }
  }

  return pack.slice(0, packSize);
}

// Special function for Deluxe Pack ex (A4B)
// 4 cards total: 3 common/uncommon + 1 guaranteed EX (4◇) or higher
function openDeluxePack(
  commonCards: Card[],
  uncommonCards: Card[],
  rareCards: Card[],
  doubleRareCards: Card[],
  artRareCards: Card[],
  superRareCards: Card[],
  immersiveCards: Card[],
  crownCards: Card[],
  packSize: number
): Card[] {
  const pack: Card[] = [];
  
  // All EX+ cards for god pack and slot 4
  const exOrBetterCards = [
    ...doubleRareCards,
    ...artRareCards,
    ...superRareCards,
    ...immersiveCards,
    ...crownCards,
  ];

  // God pack check for Deluxe (all EX+)
  if (Math.random() < GOD_PACK_CHANCE && exOrBetterCards.length >= packSize) {
    for (let i = 0; i < packSize; i++) {
      const card = pickRandom(exOrBetterCards);
      if (card) pack.push(card);
    }
    return pack;
  }

  // Slot 1-2: Common cards
  for (let i = 0; i < 2; i++) {
    const card = pickRandom(commonCards);
    if (card) pack.push(card);
  }
  
  // Slot 3: Uncommon (80%) or Rare (20%)
  const roll3 = Math.random();
  let slot3Card: Card | undefined;
  if (roll3 < 0.8) {
    slot3Card = pickRandom(uncommonCards);
  } else {
    slot3Card = pickRandom(rareCards);
  }
  if (!slot3Card) slot3Card = pickRandom(uncommonCards) || pickRandom(commonCards);
  if (slot3Card) pack.push(slot3Card);
  
  // Slot 4: Guaranteed EX (4◇) or higher
  const roll4 = Math.random();
  let slot4Card: Card | undefined;
  
  if (roll4 < DELUXE_SLOT4_RATES.crown) {
    slot4Card = pickRandom(crownCards);
  } else if (roll4 < DELUXE_SLOT4_RATES.immersive) {
    slot4Card = pickRandom(immersiveCards);
  } else if (roll4 < DELUXE_SLOT4_RATES.superRare) {
    slot4Card = pickRandom(superRareCards);
  } else if (roll4 < DELUXE_SLOT4_RATES.artRare) {
    slot4Card = pickRandom(artRareCards);
  } else {
    slot4Card = pickRandom(doubleRareCards);
  }
  
  // Fallback for slot 4 - must be EX or higher
  if (!slot4Card) {
    slot4Card = pickRandom(doubleRareCards) ||
                pickRandom(artRareCards) ||
                pickRandom(superRareCards) ||
                pickRandom(rareCards); // Last resort
  }
  if (slot4Card) pack.push(slot4Card);

  // Fill if needed
  while (pack.length < packSize) {
    const fallbackCard = pickRandom(uncommonCards) || pickRandom(commonCards);
    if (fallbackCard) {
      pack.push(fallbackCard);
    } else {
      break;
    }
  }

  return pack.slice(0, packSize);
}
