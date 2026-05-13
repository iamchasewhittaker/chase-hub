// Browser-side Supabase client. Use in Client Components only.
// Session state is stored in cookies (managed by @supabase/ssr), so the same
// session is visible to Server Components via supabase-server.ts.

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
