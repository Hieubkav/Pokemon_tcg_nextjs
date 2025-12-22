"use client";

import { useState } from "react";
import Link from "next/link";
import { useCollection } from "@/lib/collection";
import { AchievementsPopup } from "./AchievementsPopup";
import { PokedexView } from "./PokedexView";
import { BookOpen, Trophy, RotateCcw, Sparkles, FolderOpen } from "lucide-react";

interface SetData {
  id: string;
  name: string;
  cards: { id: string; localId: string; name: string; image: string; boosters?: string[] }[];
  boosters?: { id: string; name: string }[];
}

interface GameUIProps {
  sets: SetData[];
}

export function GameUI({ sets }: GameUIProps) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPokedex, setShowPokedex] = useState(false);
  const { reset, getUniqueCount, getTotalOpened } = useCollection();

  return (
    <>
      {/* Action Buttons */}
      <div className="fixed top-4 right-4 z-40 flex gap-1.5">
        <Link
          href="/wonder-pick"
          className="p-2.5 rounded-md bg-gray-800 text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 transition-colors"
          title="Wonder Pick"
        >
          <Sparkles className="w-5 h-5" />
        </Link>
        
        <button
          onClick={() => setShowPokedex(true)}
          className="p-2.5 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          title="Pokédex"
        >
          <BookOpen className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setShowAchievements(true)}
          className="p-2.5 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          title="Achievements"
        >
          <Trophy className="w-5 h-5" />
        </button>
        
        <button
          onClick={reset}
          className="p-2.5 rounded-md bg-gray-800 text-gray-300 hover:text-red-400 hover:bg-gray-700 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="fixed bottom-4 left-4 z-40 flex gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {getUniqueCount()} loại
        </span>
        <span className="flex items-center gap-1.5">
          <FolderOpen className="w-3.5 h-3.5" />
          {getTotalOpened()} đã mở
        </span>
      </div>

      {/* Popups */}
      <AchievementsPopup
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        sets={sets}
      />

      <PokedexView
        isOpen={showPokedex}
        onClose={() => setShowPokedex(false)}
        sets={sets}
      />
    </>
  );
}
