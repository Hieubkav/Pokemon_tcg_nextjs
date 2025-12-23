import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSet, getSetFolderName, getLocalPackImage, getLocalLogoPath, BOOSTER_IMAGES } from "@/lib/data";
import { PackOpeningClient } from "./PackOpeningClient";

interface PageProps {
  params: Promise<{ setId: string }>;
}

const SET_SEO_INFO: Record<string, { name: string; description: string }> = {
  A1: {
    name: "Genetic Apex",
    description: "Open Genetic Apex packs featuring Charizard, Mewtwo & Pikachu boosters. 286 cards including Crown rares!",
  },
  A1a: {
    name: "Mythical Island",
    description: "Open Mythical Island packs featuring Mew booster. 86 cards with exclusive mythical Pokemon!",
  },
  A2: {
    name: "Space-Time Smackdown",
    description: "Open Space-Time Smackdown packs featuring Dialga & Palkia boosters. 207 cards from Sinnoh region!",
  },
  A2a: {
    name: "Triumphant Light",
    description: "Open Triumphant Light mini expansion packs. 96 cards with stunning light-themed Pokemon!",
  },
  A2b: {
    name: "Shining Revelry",
    description: "Open Shining Revelry packs featuring shiny Pokemon! 111 cards including Shiny 1-star & 2-star cards!",
  },
  A3: {
    name: "Celestial Guardians",
    description: "Open Celestial Guardians packs featuring Ho-Oh & Lugia boosters. 239 cards from Johto region!",
  },
  A3a: {
    name: "Extradimensional Crisis",
    description: "Open Extradimensional Crisis mini expansion. Ultra Beasts and dimensional Pokemon await!",
  },
  A3b: {
    name: "Eevee Grove",
    description: "Open Eevee Grove packs featuring all Eeveelutions! Collect Vaporeon, Jolteon, Flareon & more!",
  },
  A4: {
    name: "Wisdom of Sea and Sky",
    description: "Open Wisdom of Sea and Sky packs. 241 cards featuring legendary sea and sky Pokemon!",
  },
  A4a: {
    name: "Secluded Springs",
    description: "Open Secluded Springs mini expansion packs. Peaceful forest and spring-themed Pokemon!",
  },
  A4B: {
    name: "Deluxe Pack ex",
    description: "Open Deluxe Pack ex with reprinted EX cards! Premium collection of powerful Pokemon ex!",
  },
  B1: {
    name: "Mega Rising",
    description: "Open Mega Rising packs featuring Mega Gyarados, Mega Blaziken & Mega Altaria! 331 cards with Mega Evolution!",
  },
  B1A: {
    name: "Crimson Blaze",
    description: "Open Crimson Blaze mini expansion packs. 103 cards featuring fire-type Pokemon and shiny cards!",
  },
  "P-A": {
    name: "Promo Pack A",
    description: "Open Promo Pack A featuring exclusive promotional cards! Limited edition Pokemon cards!",
  },
  "P-B": {
    name: "Promo Pack B",
    description: "Open Promo Pack B featuring exclusive promotional cards! Latest promo Pokemon cards!",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { setId } = await params;
  const seoInfo = SET_SEO_INFO[setId];

  if (!seoInfo) {
    return {
      title: "Pack Opening",
      description: "Open Pokemon TCG Pocket packs with stunning holographic effects",
    };
  }

  return {
    title: `${seoInfo.name} Pack Opening Simulator`,
    description: seoInfo.description,
    keywords: [
      `${seoInfo.name} pack`,
      `${seoInfo.name} cards`,
      `Pokemon TCG Pocket ${seoInfo.name}`,
      `PTCGP ${seoInfo.name}`,
      `${seoInfo.name} pack opening`,
      `${seoInfo.name} simulator`,
      "Pokemon pack opening",
      "PTCGP simulator",
    ],
    openGraph: {
      title: `${seoInfo.name} Pack Opening - Pokemon TCG Pocket Simulator`,
      description: seoInfo.description,
      type: "website",
    },
  };
}

export default async function PackPage({ params }: PageProps) {
  const { setId } = await params;
  const set = await getSet(setId);

  if (!set) {
    notFound();
  }

  const folderName = getSetFolderName(setId);
  const logoSrc = getLocalLogoPath(setId) || set.logo;

  // Get pack image: try local pack image first, then booster image, then logo
  let packImage = getLocalPackImage(setId);
  if (!packImage && set.boosters && set.boosters.length === 1) {
    const boosterKey = set.boosters[0].name.toLowerCase();
    packImage = BOOSTER_IMAGES[boosterKey] || set.logo;
  } else if (!packImage) {
    packImage = set.logo;
  }

  return (
    <main className="min-h-screen md:pt-14">
      <nav className="p-4 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Sets
        </Link>
        <div className="flex-1 flex justify-center">
          <img src={logoSrc} alt={set.name} className="h-10 object-contain" />
        </div>
        <div className="w-24" />
      </nav>

      <PackOpeningClient
        cards={set.cards}
        setId={setId}
        setName={set.name}
        packImage={packImage}
        folderName={folderName}
        boosters={set.boosters}
        boosterImages={BOOSTER_IMAGES}
      />
    </main>
  );
}

export async function generateStaticParams() {
  const setIds = ["A1", "A1a", "A2", "A2a", "A2b", "A3", "A3a", "A3b", "A4", "A4a", "A4B", "B1", "B1A", "P-A", "P-B"];
  return setIds.map((setId) => ({ setId }));
}
