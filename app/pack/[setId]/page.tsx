import { notFound } from "next/navigation";
import Link from "next/link";
import { getSet, getSetFolderName, getLocalPackImage, getLocalLogoPath, BOOSTER_IMAGES } from "@/lib/data";
import { PackOpeningClient } from "./PackOpeningClient";

interface PageProps {
  params: Promise<{ setId: string }>;
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
    <main className="min-h-screen">
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
