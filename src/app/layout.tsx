import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = "https://chase-hub.vercel.app";

export const metadata: Metadata = {
  // metadataBase makes relative URLs (like the OG image) resolve correctly
  // when crawlers scrape the page from their own servers. Without it, OG
  // tags ship with relative paths that social previews can't follow.
  metadataBase: new URL(SITE_URL),
  title: "Chase Whittaker | Payments Expert & Builder",
  description:
    "6 years at Authorize.Net and CyberSource. 14 months building with AI. Making the complex simple.",
  keywords: [
    "payments",
    "Authorize.Net",
    "CyberSource",
    "AI",
    "Claude",
    "Next.js",
    "Chase Whittaker",
  ],
  authors: [{ name: "Chase Whittaker" }],
  creator: "Chase Whittaker",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Chase Whittaker",
    title: "Chase Whittaker | Payments Expert & Builder",
    description:
      "6 years at Authorize.Net and CyberSource. 14 months building with AI. Making the complex simple.",
    // The image is auto-attached by the root opengraph-image.tsx file.
    // Listing it explicitly here is unnecessary and would override the
    // route-level convention.
  },
  twitter: {
    card: "summary_large_image",
    title: "Chase Whittaker | Payments Expert & Builder",
    description:
      "6 years at Authorize.Net and CyberSource. 14 months building with AI.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        {/* Vercel Analytics + Speed Insights — only emit data in production. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
