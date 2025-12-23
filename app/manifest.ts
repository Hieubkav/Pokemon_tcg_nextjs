import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pokemon TCG Pocket Simulator",
    short_name: "PTCGP Simulator",
    description:
      "Free Pokemon TCG Pocket pack opening simulator with stunning holographic effects. Open Genetic Apex, Mega Rising, Celestial Guardians packs.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "maskable",
      },
      {
        src: "/icon.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any",
      },
    ],
    categories: ["games", "entertainment"],
    lang: "en",
    dir: "ltr",
  };
}
