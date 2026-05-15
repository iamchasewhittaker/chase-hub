// Browser-side Supabase client. Use in Client Components only.
// Session state is stored in cookies (managed by @supabase/ssr), so the same
// session is visible to Server Components via supabase-server.ts.

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    // NEXT_PUBLIC_* must be present at build time. If they aren't, the
    // bundle has the literal `undefined` baked in — runtime is too late.
    // This guard is mostly belt-and-suspenders for local misconfig.
    throw new Error(
      "Missing Supabase env vars in client bundle: " +
        `NEXT_PUBLIC_SUPABASE_URL=${url ? "set" : "MISSING"}, ` +
        `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${key ? "set" : "MISSING"}.`,
    );
  }
  return createBrowserClient(url, key);
}
