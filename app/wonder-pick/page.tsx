import type { Metadata } from "next";
import { getAllSets, getLocalLogoPath } from "@/lib/data";
import { WonderPickContent } from "@/components/WonderPickContent";

export const metadata: Metadata = {
  title: "Wonder Pick Simulator",
  description:
    "Play Wonder Pick game from Pokemon TCG Pocket! Pick cards from mystery selection. Free Wonder Pick simulator with all expansions - Genetic Apex, Mega Rising, Celestial Guardians & more.",
  keywords: [
    "Wonder Pick",
    "Pokemon TCG Pocket Wonder Pick",
    "PTCGP Wonder Pick",
    "Wonder Pick simulator",
    "Pokemon Pocket mini game",
    "Wonder Pick free",
    "Pokemon card picking game",
    "PTCGP card game",
    "Wonder Pick online",
  ],
  openGraph: {
    title: "Wonder Pick Simulator - Pokemon TCG Pocket",
    description:
      "Play the Wonder Pick mini game from Pokemon TCG Pocket! Pick mystery cards from all expansions.",
    type: "website",
  },
};

export default async function WonderPickPage() {
  const sets = await getAllSets();

  // Filter out promo sets for Wonder Pick (they only have 1 card per pack)
  const wonderPickSets = sets.filter(set => !set.id.startsWith("P-"));

  // Prepare sets data
  const setsForContent = wonderPickSets.map((set) => ({
    id: set.id,
    name: set.name,
    logo: set.logo,
    cardCount: set.cardCount,
  }));

  // Create logo map
  const logoMap: Record<string, string> = {};
  wonderPickSets.forEach((set) => {
    const localLogo = getLocalLogoPath(set.id);
    logoMap[set.id] = localLogo || set.logo;
  });

  return (
    <main className="min-h-screen px-4 py-8 pb-24 md:px-8 md:pt-20">
      <WonderPickContent sets={setsForContent} logoMap={logoMap} />
    </main>
  );
}
