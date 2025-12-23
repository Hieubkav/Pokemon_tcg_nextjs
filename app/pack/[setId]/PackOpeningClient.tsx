"use client";

import { useState } from "react";
import { PackOpening } from "@/components/PackOpening";
import type { Card, Booster } from "@/lib/data";

interface PackOpeningClientProps {
  cards: Card[];
  setId: string;
  setName: string;
  packImage: string;
  folderName: string;
  boosters?: Booster[];
  boosterImages?: Record<string, string>;
}

const PREFIX_MAP: Record<string, string> = {
  "B1A": "B1A-",
  "A4B": "A4B-",
  "P-B": "PROMO-B-",
};

const USE_UNDERSCORE_IN_NAME = ["B1A"];

export function PackOpeningClient({
  cards,
  setId,
  setName,
  packImage,
  folderName,
  boosters,
  boosterImages,
}: PackOpeningClientProps) {
  const [selectedBooster, setSelectedBooster] = useState<string | null>(null);

  const getImagePath = (card: Card) => {
    const prefix = PREFIX_MAP[setId] || "";
    let cardName = card.name;
    
    // Handle special characters in card names
    cardName = cardName.replace(/:/g, "_"); // Type: Null -> Type_ Null
    cardName = cardName.replace(/'/g, "_"); // Apostrophes to underscores
    
    if (USE_UNDERSCORE_IN_NAME.includes(setId)) {
      cardName = cardName.replace(/ /g, "_");
    }
    
    return `/images/cards/${folderName}/${prefix}${card.localId}_${cardName}.webp`;
  };

  const hasMultipleBoosters = boosters && boosters.length > 1;

  if (hasMultipleBoosters && !selectedBooster) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
          Choose Your Pack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {boosters.map((booster) => {
            const boosterKey = booster.name.toLowerCase();
            const boosterImageSrc = boosterImages?.[boosterKey] || packImage;

            return (
              <button
                key={booster.id}
                onClick={() => setSelectedBooster(booster.name)}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-gray-500 transition-colors"
              >
                <div className="w-full aspect-[255/490] flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
                  <img
                    src={boosterImageSrc}
                    alt={booster.name}
                    className="w-full h-auto"
                  />
                </div>

                <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-gray-300 transition-colors">
                  {booster.name}
                </h3>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSelectedBooster("random")}
          className="mt-8 px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Random Pack
        </button>
      </div>
    );
  }

  let currentPackImage = packImage;
  if (selectedBooster && selectedBooster !== "random" && boosterImages) {
    const boosterKey = selectedBooster.toLowerCase();
    currentPackImage = boosterImages[boosterKey] || packImage;
  } else if (selectedBooster === "random" && boosters && boosters.length > 0 && boosterImages) {
    const randomBooster = boosters[Math.floor(Math.random() * boosters.length)];
    const boosterKey = randomBooster.name.toLowerCase();
    currentPackImage = boosterImages[boosterKey] || packImage;
  }

  return (
    <PackOpening
      cards={cards}
      setId={setId}
      setName={setName}
      packImage={currentPackImage}
      getImagePath={getImagePath}
      booster={selectedBooster && selectedBooster !== "random" ? selectedBooster.toLowerCase() : undefined}
    />
  );
}
