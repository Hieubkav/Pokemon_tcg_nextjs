import { MetadataRoute } from "next";

const BASE_URL = "https://pokemon-tcg-pocket-simulator.vercel.app";

const SET_INFO: Record<string, { name: string; folder: string }> = {
  A1: { name: "Genetic Apex", folder: "Genetic Apex" },
  A1a: { name: "Mythical Island", folder: "Mythical Island" },
  A2: { name: "Space-Time Smackdown", folder: "Space-Time Smackdown" },
  A2a: { name: "Triumphant Light", folder: "Triumphant Light" },
  A2b: { name: "Shining Revelry", folder: "Shining Revelry" },
  A3: { name: "Celestial Guardians", folder: "Celestial Guardians" },
  A3a: { name: "Extradimensional Crisis", folder: "Extradimensional Crisis" },
  A3b: { name: "Eevee Grove", folder: "Eevee Grove" },
  A4: { name: "Wisdom of Sea and Sky", folder: "Wisdom of Sea and Sky" },
  A4a: { name: "Secluded Springs", folder: "Secluded Springs" },
  A4B: { name: "Deluxe Pack ex", folder: "Deluxe Pack ex" },
  B1: { name: "Mega Rising", folder: "Mega Rising" },
  B1A: { name: "Crimson Blaze", folder: "Crimson Blaze" },
  "P-A": { name: "Promos-A", folder: "Promos-A" },
  "P-B": { name: "Promos-B", folder: "Promos-B" },
};

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/show_all`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/wonder-pick`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const packPages: MetadataRoute.Sitemap = Object.keys(SET_INFO).map(
    (setId) => ({
      url: `${BASE_URL}/pack/${setId}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })
  );

  return [...staticPages, ...packPages];
}
