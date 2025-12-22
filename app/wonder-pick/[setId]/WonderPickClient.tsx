"use client";

import { WonderPick } from "@/components/WonderPick";
import type { Card } from "@/lib/data";

interface WonderPickClientProps {
  cards: Card[];
  setId: string;
  setName: string;
  folderName: string;
}

const PREFIX_MAP: Record<string, string> = {
  "B1A": "B1A-",
  "A4B": "A4B-",
  "P-B": "PROMO-B-",
};

const USE_UNDERSCORE_IN_NAME = ["B1A"];

export function WonderPickClient({
  cards,
  setId,
  setName,
  folderName,
}: WonderPickClientProps) {
  const getImagePath = (card: Card) => {
    const prefix = PREFIX_MAP[setId] || "";
    let cardName = card.name;
    
    cardName = cardName.replace(/:/g, "_");
    cardName = cardName.replace(/'/g, "_");
    
    if (USE_UNDERSCORE_IN_NAME.includes(setId)) {
      cardName = cardName.replace(/ /g, "_");
    }
    
    return `/images/cards/${folderName}/${prefix}${card.localId}_${cardName}.webp`;
  };

  return (
    <WonderPick
      cards={cards}
      setName={setName}
      getImagePath={getImagePath}
    />
  );
}
