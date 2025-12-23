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
// Based on official Pokemon TCG Pocket rates (Game8, Dexerto, Serebii)
const SLOT5_RATES = {
  crown: 0.002,      // 0.2% - Crown rare
  immersive: 0.005,  // 0.3% - Immersive/3-star
  superRare: 0.047,  // 4.2% - Super rare/2-star  
  artRare: 0.085,    // 3.8% - Art rare/1-star
  doubleRare: 0.135, // 5% - EX/4-diamond
  rare: 0.20,        // 6.5% - Rare/3-diamond
  uncommon: 1.0,     // 80% - Uncommon (remaining)
};

// Deluxe Pack ex (A4B) - Based on Serebii official data
// Slot 4: ONLY 4-diamond EX cards (0.75% each, ~91 EX cards = 100% total)
// Secret rares (stars, crown) appear in Slot 3, NOT Slot 4

// Slot 3 rates for secret rare cards (from Serebii)
const DELUXE_SLOT3_RATES = {
  crown: 0.00198,    // 0.198% - Crown (Rare Candy)
  immersive: 0.01111, // 1.111% - 3-star (Pikachu ex)
  superRare: 0.03,   // ~2% - 2-star cards (0.156% each, ~13 cards)
  shiny: 0.047,      // ~1.7% - Shiny 2-star (0.8335% each)
  rare: 1.0,         // Rest - 3-diamond and below
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
// Based on Serebii official data:
// - Slot 1: Only 1◇ (common) cards
// - Slot 2: 1◇ and 2◇ (common/uncommon) cards  
// - Slot 3: 1◇, 2◇, 3◇ cards + SECRET RARE chance (☆, ☆☆, ☆☆☆, Crown)
// - Slot 4: ONLY 4◇ EX cards (GUARANTEED)
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
  
  // All rare+ cards for god pack
  const rareOrBetterCards = [
    ...artRareCards,
    ...superRareCards,
    ...immersiveCards,
    ...crownCards,
  ];

  // God pack check for Deluxe (all secret rare)
  if (Math.random() < GOD_PACK_CHANCE && rareOrBetterCards.length >= packSize) {
    for (let i = 0; i < packSize; i++) {
      const card = pickRandom(rareOrBetterCards);
      if (card) pack.push(card);
    }
    return pack;
  }

  // Slot 1: Only 1◇ (common) - 100% common
  const slot1Card = pickRandom(commonCards) || pickRandom(uncommonCards);
  if (slot1Card) pack.push(slot1Card);
  
  // Slot 2: 1◇ (10%) or 2◇ (90%) - mostly uncommon
  const roll2 = Math.random();
  let slot2Card: Card | undefined;
  if (roll2 < 0.10) {
    slot2Card = pickRandom(commonCards);
  } else {
    slot2Card = pickRandom(uncommonCards);
  }
  if (!slot2Card) slot2Card = pickRandom(commonCards) || pickRandom(uncommonCards);
  if (slot2Card) pack.push(slot2Card);
  
  // Slot 3: Variable - can have SECRET RARE cards!
  // Based on Serebii: Crown 0.198%, 3-star 1.111%, 2-star ~2%, rest is 3◇ or below
  const roll3 = Math.random();
  let slot3Card: Card | undefined;
  
  if (roll3 < DELUXE_SLOT3_RATES.crown) {
    slot3Card = pickRandom(crownCards);
  } else if (roll3 < DELUXE_SLOT3_RATES.immersive) {
    slot3Card = pickRandom(immersiveCards);
  } else if (roll3 < DELUXE_SLOT3_RATES.superRare) {
    slot3Card = pickRandom(superRareCards);
  } else if (roll3 < DELUXE_SLOT3_RATES.shiny) {
    slot3Card = pickRandom(artRareCards); // art-rare includes shiny 1-star
  } else {
    // Regular 3◇, 2◇, or 1◇ cards
    const subRoll = Math.random();
    if (subRoll < 0.40) {
      slot3Card = pickRandom(rareCards); // 3◇
    } else if (subRoll < 0.80) {
      slot3Card = pickRandom(uncommonCards); // 2◇
    } else {
      slot3Card = pickRandom(commonCards); // 1◇
    }
  }
  if (!slot3Card) slot3Card = pickRandom(rareCards) || pickRandom(uncommonCards) || pickRandom(commonCards);
  if (slot3Card) pack.push(slot3Card);

  // Fill slots 1-3 if needed (ensure we have 3 cards before adding EX)
  while (pack.length < 3) {
    const fallbackCard = pickRandom(commonCards) || pickRandom(uncommonCards);
    if (fallbackCard) {
      pack.push(fallbackCard);
    } else {
      break;
    }
  }
  
  // Slot 4 (LAST): GUARANTEED 4◇ EX card - ONLY EX cards here!
  // All EX cards have equal chance (0.75% each from ~91 EX cards)
  const slot4Card = pickRandom(doubleRareCards);
  if (slot4Card) {
    pack.push(slot4Card);
  } else {
    // Fallback if no EX cards available (shouldn't happen)
    const fallback = pickRandom(rareCards) || pickRandom(uncommonCards);
    if (fallback) pack.push(fallback);
  }

  return pack.slice(0, packSize);
}
