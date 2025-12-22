import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { CollectionProvider } from "@/lib/collection";
import { LocaleProvider } from "@/lib/locale";
import { NavWrapper } from "@/components/NavWrapper";
import { getAllSets, getLocalImagePath } from "@/lib/data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokemon TCG Pocket - Pack Opening Simulator",
  description: "Open Pokemon TCG Pocket packs with stunning holographic card effects",
  keywords: ["pokemon", "tcg", "pocket", "pack opening", "simulator", "cards"],
  icons: {
    icon: "/icon.webp",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sets = await getAllSets();
  
  const setsForNav = sets.map((set) => ({
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <LocaleProvider>
          <CollectionProvider>
            {children}
            <NavWrapper sets={setsForNav} />
          </CollectionProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
