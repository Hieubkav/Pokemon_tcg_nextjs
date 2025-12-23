import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { CollectionProvider } from "@/lib/collection";
import { LocaleProvider } from "@/lib/locale";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NavWrapper } from "@/components/NavWrapper";
import { StructuredData } from "@/components/StructuredData";
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
  metadataBase: new URL("https://pokemon-tcg-pocket-simulator.vercel.app"),
  title: {
    default: "Pokemon TCG Pocket Simulator | Free Pack Opening & Card Database",
    template: "%s | Pokemon TCG Pocket Simulator",
  },
  description:
    "Free Pokemon TCG Pocket pack opening simulator with stunning holographic effects. Open Genetic Apex, Mythical Island, Mega Rising, Celestial Guardians packs. Complete PTCGP card database & collection tracker.",
  keywords: [
    "Pokemon TCG Pocket",
    "PTCGP simulator",
    "pack opening simulator",
    "Pokemon Pocket cards",
    "Genetic Apex pack",
    "Mythical Island",
    "Space-Time Smackdown",
    "Mega Rising",
    "Celestial Guardians",
    "Crimson Blaze",
    "holographic cards",
    "immersive cards",
    "Pokemon Pocket database",
    "PTCGP card list",
    "Wonder Pick",
    "booster pack simulator",
    "free Pokemon simulator",
    "Pokemon TCG Pocket pack opening",
    "PTCGP booster pack",
    "Pokemon card collection",
  ],
  icons: {
    icon: "/icon.webp",
  },
  openGraph: {
    title: "Pokemon TCG Pocket Simulator - Free Pack Opening",
    description:
      "Experience the thrill of opening Pokemon TCG Pocket packs with stunning holographic effects. Open Genetic Apex, Mega Rising, Celestial Guardians & more. 100% free!",
    type: "website",
    locale: "en_US",
    siteName: "Pokemon TCG Pocket Simulator",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Pokemon TCG Pocket Pack Opening Simulator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pokemon TCG Pocket Simulator - Free Pack Opening",
    description:
      "Open Pokemon TCG Pocket packs with stunning holographic effects. Genetic Apex, Mega Rising, Celestial Guardians & more!",
    images: ["/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://pokemon-tcg-pocket-simulator.vercel.app",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider>
          <LocaleProvider>
            <CollectionProvider>
              {children}
              <NavWrapper sets={setsForNav} />
            </CollectionProvider>
          </LocaleProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
