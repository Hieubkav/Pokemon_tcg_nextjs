import type { Metadata } from "next";
import { getAllSets, getLocalImagePath } from "@/lib/data";
import { ShowAllClient } from "./ShowAllClient";

export const metadata: Metadata = {
  title: "Complete Card Database",
  description:
    "Browse all Pokemon TCG Pocket cards. Complete database of Genetic Apex, Mythical Island, Mega Rising, Celestial Guardians & all expansions. Search by set, rarity, and Pokemon type.",
  keywords: [
    "Pokemon TCG Pocket card list",
    "PTCGP database",
    "Pokemon Pocket all cards",
    "PTCGP card database",
    "Pokemon TCG Pocket collection",
    "Genetic Apex cards",
    "Mega Rising cards",
    "Celestial Guardians cards",
    "Pokemon card database",
    "PTCGP complete card list",
  ],
  openGraph: {
    title: "Complete Card Database - Pokemon TCG Pocket Simulator",
    description:
      "Browse all Pokemon TCG Pocket cards from every expansion. Complete database with all rarities!",
    type: "website",
  },
};

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
