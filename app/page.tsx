import Link from "next/link";
import { getAllSets, getLocalLogoPath, getLocalImagePath } from "@/lib/data";
import { GameUI } from "@/components/GameUI";

export default async function HomePage() {
  const sets = await getAllSets();
  
  const getLogoSrc = (setId: string, remoteLogo: string) => {
    const localLogo = getLocalLogoPath(setId);
    return localLogo || remoteLogo;
  };

  // Prepare sets data for GameUI with card images
  const setsForGameUI = sets.map((set) => ({
    id: set.id,
    name: set.name,
    cards: set.cards.map((card) => ({
      id: card.id,
      localId: card.localId,
      name: card.name,
      image: getLocalImagePath(set.id, card),
      boosters: card.boosters,
    })),
    boosters: set.boosters,
  }));

  return (
    <main className="min-h-screen px-4 py-8 pb-24 md:px-8">
      <GameUI sets={setsForGameUI} />
      
      <header className="mb-10 md:mb-14 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          Pokemon TCG Pocket
        </h1>
        <p className="mt-2 text-gray-500 text-sm md:text-base">
          Mở pack và thu thập thẻ bài
        </p>
      </header>

      <section className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-lg font-medium text-gray-300">Chọn Set</h2>
          <span className="text-xs text-gray-600">{sets.length} sets</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {sets.map((set) => (
            <Link
              key={set.id}
              href={`/pack/${set.id}`}
              className="group block bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-600 transition-colors"
            >
              <div className="h-14 md:h-16 flex items-center justify-center mb-3">
                <img
                  src={getLogoSrc(set.id, set.logo)}
                  alt={set.name}
                  className="max-h-full max-w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              
              <h3 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-1 text-center">
                {set.name}
              </h3>
                  
              <div className="flex items-center justify-center gap-2 mt-1 text-xs text-gray-500">
                <span>{set.cardCount.total}</span>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span>{set.boosters?.length || 1} pack{(set.boosters?.length || 1) > 1 ? 's' : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-16 text-gray-600 text-xs text-center">
        <p>Tạo bởi Trần Mạnh Hiếu</p>
      </footer>
    </main>
  );
}
