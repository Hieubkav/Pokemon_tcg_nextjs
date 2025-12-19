"use client";

import { useState } from "react";

interface Card {
  id: string;
  localId: string;
  name: string;
  image: string;
}

interface SetData {
  id: string;
  name: string;
  cards: Card[];
}

interface ShowAllClientProps {
  sets: SetData[];
}

export function ShowAllClient({ sets }: ShowAllClientProps) {
  const [selectedSet, setSelectedSet] = useState<string>(sets[0]?.id || "");
  const [errorCards, setErrorCards] = useState<Set<string>>(new Set());

  const handleImageError = (cardId: string) => {
    setErrorCards((prev) => new Set(prev).add(cardId));
  };

  const currentSet = sets.find((s) => s.id === selectedSet);
  const errorCount = currentSet?.cards.filter((c) => errorCards.has(c.id)).length || 0;

  return (
    <main className="min-h-screen p-4">
      <div className="flex items-baseline gap-4 mb-4">
        <h1 className="text-xl font-bold text-white">Debug View</h1>
        {errorCount > 0 && (
          <span className="text-sm text-red-400">{errorCount} errors</span>
        )}
      </div>

      {/* Set Selector */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {sets.map((set) => (
          <button
            key={set.id}
            onClick={() => setSelectedSet(set.id)}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              selectedSet === set.id
                ? "bg-white text-gray-900"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {set.id} ({set.cards.length})
          </button>
        ))}
      </div>

      {currentSet && (
        <section>
          <div className="flex items-baseline gap-3 mb-3">
            <h2 className="text-lg font-semibold text-white">{currentSet.name}</h2>
            <span className="text-sm text-gray-600">{currentSet.cards.length} cards</span>
          </div>

          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1">
            {currentSet.cards.map((card) => {
              const hasError = errorCards.has(card.id);
              return (
                <div
                  key={card.id}
                  className={`relative aspect-[2.5/3.5] rounded overflow-hidden bg-gray-900 group ${
                    hasError ? "ring-2 ring-red-500" : ""
                  }`}
                >
                  {!hasError && (
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => handleImageError(card.id)}
                    />
                  )}
                  {hasError && (
                    <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center">
                      <span className="text-[10px] text-red-300 text-center px-1">
                        ERROR
                        <br />#{card.localId}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
                    <span className="text-[9px] text-white text-center leading-tight">
                      {card.name}
                    </span>
                    <span className="text-[8px] text-gray-400">#{card.localId}</span>
                    <span className="text-[7px] text-gray-500 mt-1 break-all">{card.image.split('/').pop()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
