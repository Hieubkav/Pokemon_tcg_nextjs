import { notFound } from "next/navigation";
import { getSet, getSetFolderName } from "@/lib/data";
import { WonderPickClient } from "./WonderPickClient";

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
    <main className="min-h-screen md:pt-14">
      <WonderPickClient
        cards={set.cards}
        setId={setId}
        setName={set.name}
        folderName={folderName}
      />
    </main>
  );
}
