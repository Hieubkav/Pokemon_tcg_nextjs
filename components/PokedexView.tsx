"use client";

import { useState } from "react";
import { useCollection } from "@/lib/collection";
import { BookOpen, X, HelpCircle } from "lucide-react";

interface Card {
  id: string;
  localId: string;
  name: string;
  image: string;
  boosters?: string[];
}

interface SetData {
  id: string;
  name: string;
  cards: Card[];
  boosters?: { id: string; name: string }[];
}

interface PokedexViewProps {
  isOpen: boolean;
  onClose: () => void;
  sets: SetData[];
}

export function PokedexView({ isOpen, onClose, sets }: PokedexViewProps) {
  const { hasCard, getCardCount } = useCollection();
  const [selectedSet, setSelectedSet] = useState<string>(sets[0]?.id || "");
  const [selectedBooster, setSelectedBooster] = useState<string>("all");

  if (!isOpen) return null;

  const currentSet = sets.find((s) => s.id === selectedSet);
  const boosters = currentSet?.boosters || [];

  let filteredCards = currentSet?.cards || [];
  if (selectedBooster !== "all" && boosters.length > 0) {
    const boosterName = boosters.find((b) => b.id === selectedBooster)?.name;
    if (boosterName) {
      filteredCards = filteredCards.filter((c) => c.boosters?.includes(boosterName));
    }
  }

  const collectedCount = filteredCards.filter((c) => hasCard(c.id)).length;
  const totalCount = filteredCards.length;
  const progress = totalCount > 0 ? (collectedCount / totalCount) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-400" />
              Pokédex
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Set Selection */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {sets.map((set) => (
              <button
                key={set.id}
                onClick={() => {
                  setSelectedSet(set.id);
                  setSelectedBooster("all");
                }}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedSet === set.id
                    ? "bg-white text-gray-900"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {set.name}
              </button>
            ))}
          </div>

          {/* Booster Selection */}
          {boosters.length > 1 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button
                onClick={() => setSelectedBooster("all")}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedBooster === "all"
                    ? "bg-gray-700 text-white"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                All
              </button>
              {boosters.map((booster) => (
                <button
                  key={booster.id}
                  onClick={() => setSelectedBooster(booster.id)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    selectedBooster === booster.id
                      ? "bg-gray-700 text-white"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  {booster.name}
                </button>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/70 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 tabular-nums">
              {collectedCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-12 gap-1.5">
            {filteredCards.map((card) => {
              const collected = hasCard(card.id);
              const count = getCardCount(card.id);
              
              return (
                <div
                  key={card.id}
                  className={`relative aspect-[2.5/3.5] rounded overflow-hidden ${
                    collected ? "hover:ring-1 hover:ring-white/30" : "opacity-40"
                  }`}
                  title={collected ? `${card.name} (x${count})` : `#${card.localId}`}
                >
                  {collected ? (
                    <>
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {count > 1 && (
                        <div className="absolute bottom-0 right-0 bg-white text-gray-900 text-[9px] font-medium px-1 rounded-tl">
                          {count}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <span className="text-[10px] text-gray-700">#{card.localId}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
