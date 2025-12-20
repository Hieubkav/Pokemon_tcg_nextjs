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
    const cardName = USE_UNDERSCORE_IN_NAME.includes(setId)
      ? card.name.replace(/ /g, "_")
      : card.name;
    return `/images/cards/${folderName}/${prefix}${card.localId}_${cardName}.webp`;
  };

  const hasMultipleBoosters = boosters && boosters.length > 1;

  if (hasMultipleBoosters && !selectedBooster) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
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
                className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                <div className="relative z-10">
                  <div className="w-full aspect-[255/490] flex items-center justify-center mb-4 bg-black/30 rounded-xl overflow-hidden">
                    <img
                      src={boosterImageSrc}
                      alt={booster.name}
                      className="w-full h-auto"
                    />
                  </div>

                  <h3 className="text-xl font-semibold text-center group-hover:text-yellow-400 transition-colors">
                    {booster.name}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSelectedBooster("random")}
          className="mt-8 px-6 py-3 rounded-full bg-white/10 text-white border border-white/30 font-semibold hover:bg-white/20 transition-colors"
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
