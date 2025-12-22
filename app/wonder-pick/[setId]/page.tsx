import { notFound } from "next/navigation";
import Link from "next/link";
import { getSet, getSetFolderName } from "@/lib/data";
import { WonderPickClient } from "./WonderPickClient";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ setId: string }>;
}

export default async function WonderPickSetPage({ params }: Props) {
  const { setId } = await params;
  const set = await getSet(setId);
  
  if (!set) {
    notFound();
  }

  const folderName = getSetFolderName(setId);

  return (
    <main className="min-h-screen">
      <Link
        href="/wonder-pick"
        className="fixed top-4 left-4 z-40 p-2.5 rounded-md bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>
      
      <WonderPickClient
        cards={set.cards}
        setId={setId}
        setName={set.name}
        folderName={folderName}
      />
    </main>
  );
}
