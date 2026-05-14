// Generates /robots.txt. Disallows admin/login (and the auth callback
// which doesn't deserve to be indexed even if it 404s on GET).

import type { MetadataRoute } from "next";

const BASE_URL = "https://chase-hub.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login", "/auth/", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
