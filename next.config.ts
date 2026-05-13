import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack to this project. Without it, Next walks up looking for a
  // lockfile and finds /Users/chase/package-lock.json (or the parent chase/
  // pnpm-workspace), which causes a confusing workspace-root warning.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
