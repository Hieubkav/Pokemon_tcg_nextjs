export function StructuredData() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Pokemon TCG Pocket Simulator",
    alternateName: ["PTCGP Simulator", "Pokemon Pocket Pack Opening"],
    url: "https://pokemon-tcg-pocket-simulator.vercel.app",
    description:
      "Free Pokemon TCG Pocket pack opening simulator with stunning holographic effects. Complete card database for PTCGP.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://pokemon-tcg-pocket-simulator.vercel.app/show_all?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Pokemon TCG Pocket Simulator",
    applicationCategory: "GameApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
      bestRating: "5",
      worstRating: "1",
    },
    description:
      "Open Pokemon TCG Pocket packs with stunning holographic card effects. Features Genetic Apex, Mega Rising, Celestial Guardians and all expansion packs.",
    screenshot: "https://pokemon-tcg-pocket-simulator.vercel.app/og-image.webp",
    featureList: [
      "Pack Opening Simulator",
      "Holographic Card Effects",
      "Complete Card Database",
      "Wonder Pick Game",
      "Collection Tracker",
      "All Expansion Packs",
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pokemon TCG Pocket Simulator",
    url: "https://pokemon-tcg-pocket-simulator.vercel.app",
    logo: "https://pokemon-tcg-pocket-simulator.vercel.app/icon.webp",
    sameAs: [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
