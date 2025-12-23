"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale";

interface SetData {
  id: string;
  name: string;
  logo: string;
  cardCount: { total: number };
  boosters?: { id: string; name: string }[];
}

interface HomeContentProps {
  sets: SetData[];
  logoMap: Record<string, string>;
}

export function HomeContent({ sets, logoMap }: HomeContentProps) {
  const getLogoSrc = (setId: string, remoteLogo: string) => logoMap[setId] || remoteLogo;
  const { t } = useLocale();

  return (
    <>
      <header className="mb-10 md:mb-14 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t("home.title")}
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm md:text-base">
          {t("home.subtitle")}
        </p>
      </header>

      <section className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">{t("home.selectSet")}</h2>
          <span className="text-xs text-gray-500 dark:text-gray-500">{sets.length} {t("home.sets")}</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {sets.map((set) => (
            <Link
              key={set.id}
              href={`/pack/${set.id}`}
              className="group block bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-gray-500 transition-colors"
            >
              <div className="h-14 md:h-16 flex items-center justify-center mb-3">
                <img
                  src={getLogoSrc(set.id, set.logo)}
                  alt={set.name}
                  className="max-h-full max-w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-amber-600 dark:group-hover:text-white transition-colors line-clamp-1 text-center">
                {set.name}
              </h3>
                  
              <div className="flex items-center justify-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-500">
                <span>{set.cardCount.total}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span>
                  {set.boosters?.length || 1} {(set.boosters?.length || 1) > 1 ? t("home.packs") : t("home.pack")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-16 text-gray-500 dark:text-gray-600 text-xs text-center">
        <p>{t("home.footer")}</p>
      </footer>
    </>
  );
}
