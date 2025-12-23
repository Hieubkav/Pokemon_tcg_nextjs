"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, BookOpen, Trophy, RotateCcw, FolderOpen } from "lucide-react";
import { useLocale } from "@/lib/locale";
import { useCollection } from "@/lib/collection";
import { AchievementsPopup } from "./AchievementsPopup";
import { PokedexView } from "./PokedexView";
import { ThemeToggle } from "./ThemeToggle";

interface SetData {
  id: string;
  name: string;
  cards: { id: string; localId: string; name: string; image: string; boosters?: string[] }[];
  boosters?: { id: string; name: string }[];
}

interface GlobalNavProps {
  sets: SetData[];
}

export function GlobalNav({ sets }: GlobalNavProps) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPokedex, setShowPokedex] = useState(false);
  const pathname = usePathname();
  const { t } = useLocale();
  const { reset, getUniqueCount, getTotalOpened } = useCollection();

  const isHome = pathname === "/";
  const isWonderPick = pathname.startsWith("/wonder-pick");

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-4">
          {/* Left - Logo/Home */}
          <Link
            href="/"
            className={`flex items-center gap-2 font-semibold transition-colors ${
              isHome ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Pokemon TCG Pocket</span>
          </Link>

          {/* Center - Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              {getUniqueCount()} {t("stats.types")}
            </span>
            <span className="flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4" />
              {getTotalOpened()} {t("stats.opened")}
            </span>
          </div>

          {/* Right - Navigation */}
          <div className="flex items-center gap-1">
            <Link
              href="/wonder-pick"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors ${
                isWonderPick
                  ? "text-yellow-600 dark:text-yellow-400 bg-yellow-400/10"
                  : "text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">{t("common.wonderPick")}</span>
            </Link>

            <button
              onClick={() => setShowPokedex(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">{t("common.pokedex")}</span>
            </button>

            <button
              onClick={() => setShowAchievements(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span className="text-sm">{t("common.achievements")}</span>
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

            <ThemeToggle />

            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title={t("common.reset")}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header - Theme Toggle */}
      <div className="fixed top-3 right-3 z-40 md:hidden">
        <ThemeToggle />
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center justify-around h-16 px-2">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
              isHome ? "text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t("common.home")}</span>
          </Link>

          <Link
            href="/wonder-pick"
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
              isWonderPick ? "text-yellow-600 dark:text-yellow-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t("common.wonderPick")}</span>
          </Link>

          <button
            onClick={() => setShowPokedex(true)}
            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t("common.pokedex")}</span>
          </button>

          <button
            onClick={() => setShowAchievements(true)}
            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t("common.achievements")}</span>
          </button>
        </div>
      </nav>

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
