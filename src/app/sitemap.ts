// Generates /sitemap.xml. Listed at the bottom of robots.txt so crawlers
// can find it. Update when new routes are added.

import type { MetadataRoute } from "next";

const BASE_URL = "https://chase-hub.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/payments`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    // /login and /admin are auth-gated; we don't list them.
  ];
}
