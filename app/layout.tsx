import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CollectionProvider } from "@/lib/collection";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <CollectionProvider>
          {children}
        </CollectionProvider>
      </body>
    </html>
  );
}
