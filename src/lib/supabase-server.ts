// Server-side Supabase client. Use in Server Components, Route Handlers,
// and Server Actions.
//
// `cookies()` is async in Next.js 15+ (and Next 16 keeps that). The
// `setAll` handler may throw inside Server Components — that's expected;
// proxy.ts is responsible for refreshing sessions there.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — cookies can't be mutated there.
            // proxy.ts refreshes sessions, so this is safe to swallow.
          }
        },
      },
    },
  );
}

// Quick auth check for Server Components / Route Handlers.
// Returns the JWT email claim if Chase is signed in, else null.
// Use this instead of checking session shape ad-hoc.
export async function getChaseEmailFromSession(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

export const ADMIN_EMAIL = "chase.t.whittaker@gmail.com";

export function isAdmin(email: string | null): boolean {
  return email === ADMIN_EMAIL;
}
