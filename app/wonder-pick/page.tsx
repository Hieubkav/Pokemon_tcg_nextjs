import { getAllSets, getLocalLogoPath } from "@/lib/data";
import { WonderPickContent } from "@/components/WonderPickContent";

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
