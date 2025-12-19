"use client";

import type { Card } from "./data";

export function openPackClient(
  cards: Card[],
  packSize: number = 6,
  booster?: string
): Card[] {
  // Filter cards by booster if specified
  let availableCards = cards;
  if (booster) {
    availableCards = cards.filter(c => {
      const cardBoosters = (c as any).boosters;
      return cardBoosters && Array.isArray(cardBoosters) && cardBoosters.includes(booster);
    });
  }

  const commonCards = availableCards.filter(c => c.rarity === "common");
  const uncommonCards = availableCards.filter(c => c.rarity === "uncommon");
  const rareCards = availableCards.filter(c => c.rarity === "rare");
  const doubleRareCards = availableCards.filter(c => c.rarity === "double-rare");
  const artRareCards = availableCards.filter(c => c.rarity === "art-rare");
  const superRareCards = availableCards.filter(c => c.rarity === "super-rare");
  const crownCards = availableCards.filter(c => c.rarity === "crown");

  const pack: Card[] = [];
  
  // Slot 1-3: Common cards
  for (let i = 0; i < 3; i++) {
    if (commonCards.length > 0) {
      pack.push(commonCards[Math.floor(Math.random() * commonCards.length)]);
    }
  }
  
  // Slot 4: Uncommon or better
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
  
  // Slot 5: Uncommon or better (higher rare chance)
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

  // Slot 6: Random from uncommon or better
  const roll6 = Math.random();
  if (roll6 < 0.01 && crownCards.length > 0) {
    pack.push(crownCards[Math.floor(Math.random() * crownCards.length)]);
  } else if (roll6 < 0.05 && superRareCards.length > 0) {
    pack.push(superRareCards[Math.floor(Math.random() * superRareCards.length)]);
  } else if (roll6 < 0.1 && artRareCards.length > 0) {
    pack.push(artRareCards[Math.floor(Math.random() * artRareCards.length)]);
  } else if (roll6 < 0.25 && doubleRareCards.length > 0) {
    pack.push(doubleRareCards[Math.floor(Math.random() * doubleRareCards.length)]);
  } else if (roll6 < 0.6 && rareCards.length > 0) {
    pack.push(rareCards[Math.floor(Math.random() * rareCards.length)]);
  } else if (uncommonCards.length > 0) {
    pack.push(uncommonCards[Math.floor(Math.random() * uncommonCards.length)]);
  } else if (commonCards.length > 0) {
    pack.push(commonCards[Math.floor(Math.random() * commonCards.length)]);
  }

  // Fill remaining slots if needed
  while (pack.length < packSize && cards.length > 0) {
    pack.push(cards[Math.floor(Math.random() * cards.length)]);
  }

  return pack.slice(0, packSize);
}
