import { getAllSets, getLocalLogoPath } from "@/lib/data";
import { GameUI } from "@/components/GameUI";
import { HomeContent } from "@/components/HomeContent";

export default async function HomePage() {
  const sets = await getAllSets();

  // Prepare sets data for HomeContent
  const setsForHome = sets.map((set) => ({
    id: set.id,
    name: set.name,
    logo: set.logo,
    cardCount: set.cardCount,
    boosters: set.boosters,
  }));

  // Create logo map
  const logoMap: Record<string, string> = {};
  sets.forEach((set) => {
    const localLogo = getLocalLogoPath(set.id);
    logoMap[set.id] = localLogo || set.logo;
  });

  return (
    <main className="min-h-screen px-4 py-8 pb-24 md:px-8">
      <GameUI />
      <HomeContent sets={setsForHome} logoMap={logoMap} />
    </main>
  );
}
