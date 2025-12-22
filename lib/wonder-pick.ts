"use client";

import type { Card } from "./data";

// Wonder Pick generates 5 cards for the player to choose 1
// At least 1 card should be one the player doesn't own (unless they own all)
export interface WonderPickResult {
  cards: Card[];
  selectedIndex: number | null;
}

// Generate cards for Wonder Pick with priority to include at least 1 unowned card
export function generateWonderPick(
  allCards: Card[],
  ownedCardIds: Set<string>,
  count: number = 5
): Card[] {
  if (allCards.length === 0) return [];
  
  const unownedCards = allCards.filter(c => !ownedCardIds.has(c.id));
  const ownedCards = allCards.filter(c => ownedCardIds.has(c.id));
  
  const result: Card[] = [];
  
  // If there are unowned cards, guarantee at least 1 (and up to 3) in the pick
  if (unownedCards.length > 0) {
    // Add 1-3 unowned cards (random amount to keep it interesting)
    const unownedCount = Math.min(
      unownedCards.length,
      Math.floor(Math.random() * 3) + 1 // 1-3 unowned cards
    );
    
    const shuffledUnowned = [...unownedCards].sort(() => Math.random() - 0.5);
    for (let i = 0; i < unownedCount && result.length < count; i++) {
      result.push(shuffledUnowned[i]);
    }
  }
  
  // Fill remaining slots with random cards (prefer owned to make it challenging)
  const remainingCount = count - result.length;
  if (remainingCount > 0) {
    // Use owned cards if available, otherwise use all cards
    const fillPool = ownedCards.length > 0 ? ownedCards : allCards;
    const shuffledFill = [...fillPool].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < remainingCount && i < shuffledFill.length; i++) {
      // Avoid duplicates
      if (!result.find(c => c.id === shuffledFill[i].id)) {
        result.push(shuffledFill[i]);
      }
    }
  }
  
  // If still not enough cards, add from all cards
  while (result.length < count && result.length < allCards.length) {
    const shuffledAll = [...allCards].sort(() => Math.random() - 0.5);
    for (const card of shuffledAll) {
      if (!result.find(c => c.id === card.id)) {
        result.push(card);
        if (result.length >= count) break;
      }
    }
  }
  
  // Shuffle the final result so unowned cards aren't always in the same positions
  return result.sort(() => Math.random() - 0.5);
}

// Calculate stamina cost based on highest rarity in the pick
export function getStaminaCost(cards: Card[]): number {
  const rarityOrder = [
    "common",
    "uncommon", 
    "rare",
    "double-rare",
    "art-rare",
    "super-rare",
    "immersive",
    "crown"
  ];
  
  let maxRarityIndex = 0;
  for (const card of cards) {
    const rarityIndex = rarityOrder.indexOf(card.rarity || "common");
    if (rarityIndex > maxRarityIndex) {
      maxRarityIndex = rarityIndex;
    }
  }
  
  // Stamina costs based on rarity
  // Common/Uncommon: 1, Rare: 2, Double-rare/Art-rare: 3, Super-rare+: 4
  if (maxRarityIndex <= 1) return 1;
  if (maxRarityIndex === 2) return 2;
  if (maxRarityIndex <= 4) return 3;
  return 4;
}
