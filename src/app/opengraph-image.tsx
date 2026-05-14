// Generates the social-share image at /opengraph-image (1200×630 PNG).
// Used as the default OG and Twitter card for the whole site. Per-route
// pages can override this by adding their own opengraph-image.tsx file.
//
// Built with next/og — Next.js bundles a minimal Satori renderer that
// understands a subset of CSS. Only inline styles, only `display: flex`
// or `display: none`. No Tailwind classes. No external images unless
// you fetch them as ArrayBuffer.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Chase Whittaker. Payments expert. Builder. Making the complex simple.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens, hardcoded here because we can't import from globals.css.
// Keep in sync with src/app/globals.css.
const COLORS = {
  background: "#FAFAF8",
  surface: "#FFFFFF",
  foreground: "#1A1A1A",
  muted: "#6B7280",
  accent: "#2563EB",
  border: "#E5E7EB",
};

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: COLORS.background,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top row: name + role */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 24,
              color: COLORS.muted,
              letterSpacing: 4,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Chase Whittaker
          </div>
        </div>

        {/* Center: tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: COLORS.foreground,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            Payments expert. Builder.
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: COLORS.accent,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            Making the complex simple.
          </div>
        </div>

        {/* Bottom row: credentials + URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: `1px solid ${COLORS.border}`,
            paddingTop: 28,
          }}
        >
          <div
            style={{
              fontSize: 26,
              color: COLORS.muted,
              maxWidth: 720,
              lineHeight: 1.35,
            }}
          >
            6 years at Authorize.Net and CyberSource. 14 months building with AI.
          </div>
          <div
            style={{
              fontSize: 26,
              color: COLORS.accent,
              fontWeight: 600,
            }}
          >
            chasewhittaker.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
