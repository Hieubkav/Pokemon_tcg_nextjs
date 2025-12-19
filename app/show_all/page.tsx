import { getAllSets, getLocalImagePath } from "@/lib/data";
import { ShowAllClient } from "./ShowAllClient";

export default async function ShowAllPage() {
  const sets = await getAllSets();

  const setsData = sets.map((set) => ({
    id: set.id,
    name: set.name,
    cards: set.cards.map((card) => ({
      id: card.id,
      localId: card.localId,
      name: card.name,
      image: getLocalImagePath(set.id, card),
    })),
  }));

  return <ShowAllClient sets={setsData} />;
}
