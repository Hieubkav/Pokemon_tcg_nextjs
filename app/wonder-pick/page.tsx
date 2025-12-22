import Link from "next/link";
import { getAllSets, getLocalLogoPath } from "@/lib/data";
import { ArrowLeft } from "lucide-react";
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
    <main className="min-h-screen px-4 py-8 pb-24 md:px-8">
      <Link
        href="/"
        className="fixed top-4 left-4 z-40 p-2.5 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <WonderPickContent sets={setsForContent} logoMap={logoMap} />
    </main>
  );
}
