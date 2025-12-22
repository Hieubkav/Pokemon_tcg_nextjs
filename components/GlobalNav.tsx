"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, BookOpen, Trophy, Globe } from "lucide-react";
import { useLocale } from "@/lib/locale";
import { AchievementsPopup } from "./AchievementsPopup";
import { PokedexView } from "./PokedexView";

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
  const { locale, setLocale, t } = useLocale();

  const isHome = pathname === "/";
  const isWonderPick = pathname.startsWith("/wonder-pick");

  const toggleLocale = () => {
    setLocale(locale === "en" ? "vi" : "en");
  };

  return (
    <>
      {/* Desktop Navigation - Top Right */}
      <div className="fixed top-4 right-4 z-40 flex gap-1.5">
        <button
          onClick={toggleLocale}
          className="p-2.5 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors flex items-center gap-1.5"
          title={locale === "en" ? "Switch to Vietnamese" : "Chuyển sang Tiếng Anh"}
        >
          <Globe className="w-5 h-5" />
          <span className="text-xs font-medium uppercase">{locale}</span>
        </button>

        <Link
          href="/wonder-pick"
          className={`hidden md:flex p-2.5 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors ${
            isWonderPick ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"
          }`}
          title={t("common.wonderPick")}
        >
          <Sparkles className="w-5 h-5" />
        </Link>

        <button
          onClick={() => setShowPokedex(true)}
          className="hidden md:flex p-2.5 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          title={t("common.pokedex")}
        >
          <BookOpen className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowAchievements(true)}
          className="hidden md:flex p-2.5 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          title={t("common.achievements")}
        >
          <Trophy className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
        <div className="flex items-center justify-around h-16 px-2">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
              isHome ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t("common.home")}</span>
          </Link>

          <Link
            href="/wonder-pick"
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
              isWonderPick ? "text-yellow-400" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t("common.wonderPick")}</span>
          </Link>

          <button
            onClick={() => setShowPokedex(true)}
            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-1">{t("common.pokedex")}</span>
          </button>

          <button
            onClick={() => setShowAchievements(true)}
            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 hover:text-gray-300 transition-colors"
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
