import Link from "next/link";
import { getAllSets, getLocalLogoPath } from "@/lib/data";
import { Sparkles, ArrowLeft } from "lucide-react";

export default async function WonderPickPage() {
  const sets = await getAllSets();
  
  const getLogoSrc = (setId: string, remoteLogo: string) => {
    const localLogo = getLocalLogoPath(setId);
    return localLogo || remoteLogo;
  };

  // Filter out promo sets for Wonder Pick (they only have 1 card per pack)
  const wonderPickSets = sets.filter(set => !set.id.startsWith("P-"));

  return (
    <main className="min-h-screen px-4 py-8 pb-24 md:px-8">
      <Link
        href="/"
        className="fixed top-4 left-4 z-40 p-2.5 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <header className="mb-10 md:mb-14 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
          Wonder Pick
        </h1>
        <p className="mt-2 text-gray-500 text-sm md:text-base">
          Chọn 1 trong 5 thẻ bí ẩn - may mắn sẽ đến với bạn!
        </p>
      </header>

      <section className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-lg font-medium text-gray-300">Chọn Set</h2>
          <span className="text-xs text-gray-600">{wonderPickSets.length} sets</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {wonderPickSets.map((set) => (
            <Link
              key={set.id}
              href={`/wonder-pick/${set.id}`}
              className="group block bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-yellow-500/50 transition-colors hover:shadow-lg hover:shadow-yellow-500/10"
            >
              <div className="h-14 md:h-16 flex items-center justify-center mb-3">
                <img
                  src={getLogoSrc(set.id, set.logo)}
                  alt={set.name}
                  className="max-h-full max-w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              
              <h3 className="text-sm font-medium text-gray-200 group-hover:text-yellow-400 transition-colors line-clamp-1 text-center">
                {set.name}
              </h3>
                  
              <div className="flex items-center justify-center gap-2 mt-1 text-xs text-gray-500">
                <span>{set.cardCount.total} thẻ</span>
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
