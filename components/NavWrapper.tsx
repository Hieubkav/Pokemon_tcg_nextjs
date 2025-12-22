"use client";

import { GlobalNav } from "./GlobalNav";

interface SetData {
  id: string;
  name: string;
  cards: { id: string; localId: string; name: string; image: string; boosters?: string[] }[];
  boosters?: { id: string; name: string }[];
}

interface NavWrapperProps {
  sets: SetData[];
}

export function NavWrapper({ sets }: NavWrapperProps) {
  return <GlobalNav sets={sets} />;
}
