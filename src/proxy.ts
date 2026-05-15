// Next.js 16 renamed `middleware.ts` to `proxy.ts` — same functionality.
// This runs on every request to /admin/* and /api/posts/* to refresh the
// Supabase session cookie so server-side auth checks see a valid user.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_EMAIL = "chase.t.whittaker@gmail.com";

// Fail loud, not cryptic. If either Supabase env var is missing, every
// request would otherwise return Internal Server Error from inside
// createServerClient(undefined, undefined) — no clue what's wrong from
// the error message. This throws the actual diagnosis into Vercel logs.
function requireSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      `Missing Supabase env vars in ${process.env.VERCEL_ENV ?? "this environment"}. ` +
        `NEXT_PUBLIC_SUPABASE_URL=${url ? "set" : "MISSING"}, ` +
        `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${key ? "set" : "MISSING"}. ` +
        `Add them via Vercel dashboard or 'vercel env add ... preview --value ... --yes'.`,
    );
  }
  return { url, key };
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { url, key } = requireSupabaseEnv();
  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Cookies set here propagate to both the request (for downstream
          // server code in this same request) and the response (so the
          // browser receives the refreshed cookie).
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Touch auth to trigger a session refresh if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPath = pathname === "/login";

  // /admin requires Chase's session.
  if (isAdminPath && user?.email !== ADMIN_EMAIL) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Already signed in as Chase? Skip /login.
  if (isLoginPath && user?.email === ADMIN_EMAIL) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on app routes, but skip static assets, images, and Next internals.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
