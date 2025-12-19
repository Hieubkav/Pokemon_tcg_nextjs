import Link from "next/link";
import { getAllSets, getLocalLogoPath, getLocalPackImage, BOOSTER_IMAGES } from "@/lib/data";

export default async function HomePage() {
  const sets = await getAllSets();
  
  const getLogoSrc = (setId: string, remoteLogo: string) => {
    const localLogo = getLocalLogoPath(setId);
    return localLogo || remoteLogo;
  };

  const getPackImages = (setId: string, boosters?: { id: string; name: string }[]) => {
    const localPack = getLocalPackImage(setId);
    if (localPack) return [localPack];
    
    if (boosters && boosters.length > 0) {
      const images = boosters
        .slice(0, 3)
        .map(b => BOOSTER_IMAGES[b.name.toLowerCase()])
        .filter(Boolean);
      if (images.length > 0) return images;
    }
    return [];
  };

  return (
    <main className="min-h-screen p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
          Pokemon TCG Pocket
        </h1>
        <p className="text-lg text-gray-400">
          Open packs and collect cards with stunning holographic effects
        </p>
      </header>

      <section className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Select a Set to Open</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sets.map((set) => {
            const packImages = getPackImages(set.id, set.boosters);
            return (
              <Link
                key={set.id}
                href={`/pack/${set.id}`}
                className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/20 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                
                <div className="relative z-10">
                  {/* Logo */}
                  <div className="h-16 flex items-center justify-center mb-4">
                    <img
                      src={getLogoSrc(set.id, set.logo)}
                      alt={set.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-lg"
                    />
                  </div>

                  {/* Pack Images */}
                  {packImages.length > 0 && (
                    <div className="relative h-40 flex items-center justify-center mb-4">
                      {packImages.length === 1 ? (
                        <img
                          src={packImages[0]}
                          alt={`${set.name} pack`}
                          className="h-36 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : packImages.length === 2 ? (
                        <div className="relative flex items-center justify-center">
                          <img
                            src={packImages[0]}
                            alt={`${set.name} pack 1`}
                            className="h-32 object-contain drop-shadow-xl -rotate-6 -translate-x-2 group-hover:-rotate-12 group-hover:-translate-x-4 transition-all duration-300"
                          />
                          <img
                            src={packImages[1]}
                            alt={`${set.name} pack 2`}
                            className="h-32 object-contain drop-shadow-xl rotate-6 translate-x-2 group-hover:rotate-12 group-hover:translate-x-4 transition-all duration-300"
                          />
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center">
                          <img
                            src={packImages[0]}
                            alt={`${set.name} pack 1`}
                            className="absolute h-28 object-contain drop-shadow-xl -rotate-12 -translate-x-8 group-hover:-rotate-20 group-hover:-translate-x-12 transition-all duration-300 z-0"
                          />
                          <img
                            src={packImages[1]}
                            alt={`${set.name} pack 2`}
                            className="h-32 object-contain drop-shadow-2xl z-10 group-hover:scale-110 transition-all duration-300"
                          />
                          <img
                            src={packImages[2]}
                            alt={`${set.name} pack 3`}
                            className="absolute h-28 object-contain drop-shadow-xl rotate-12 translate-x-8 group-hover:rotate-20 group-hover:translate-x-12 transition-all duration-300 z-0"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <h3 className="text-xl font-semibold text-center mb-2 group-hover:text-yellow-400 transition-colors">
                    {set.name}
                  </h3>
                  
                  <div className="flex justify-center gap-4 text-sm text-gray-400">
                    <span>{set.cardCount.total} Cards</span>
                    <span>|</span>
                    <span>{set.boosters?.length || 1} Packs</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="text-center mt-16 text-gray-500 text-sm">
        <p>Fan project - Not affiliated with Nintendo or The Pokemon Company</p>
        <p className="mt-2">
          Card effects inspired by{" "}
          <a
            href="https://poke-holo.simey.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-500 hover:underline"
          >
            poke-holo.simey.me
          </a>
        </p>
      </footer>
    </main>
  );
}
