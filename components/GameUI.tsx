"use client";

import { useCollection } from "@/lib/collection";
import { useLocale } from "@/lib/locale";
import { RotateCcw, Sparkles, FolderOpen } from "lucide-react";

export function GameUI() {
  const { reset, getUniqueCount, getTotalOpened } = useCollection();
  const { t } = useLocale();

  return (
    <>
      {/* Reset Button - Desktop (next to language switcher) */}
      <div className="fixed top-4 right-20 z-40 hidden md:flex gap-1.5">
        <button
          onClick={reset}
          className="p-2.5 rounded-md bg-gray-800 text-gray-300 hover:text-red-400 hover:bg-gray-700 transition-colors"
          title={t("common.reset")}
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats - Desktop */}
      <div className="hidden md:flex fixed bottom-4 left-4 z-40 gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {getUniqueCount()} {t("stats.types")}
        </span>
        <span className="flex items-center gap-1.5">
          <FolderOpen className="w-3.5 h-3.5" />
          {getTotalOpened()} {t("stats.opened")}
        </span>
      </div>
    </>
  );
}
