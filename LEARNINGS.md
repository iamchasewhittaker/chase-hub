# Learnings — chase-hub

Per-project lessons. New entries go at the top.

---

## 2026-05-15 — Preview deploys silently 500 when env vars are Production-only

**What happened:** First Vercel preview deploy after Phases 1–4 returned "Internal Server Error" on every route, including `/`. Local `pnpm dev` worked fine. Production worked fine. Only previews broke.

**Root cause:** `proxy.ts` runs on every request and calls `createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, …)`. The Supabase env vars were configured in the Vercel dashboard for **Production only**, not Preview. So on preview, both values were `undefined`. The `!` (non-null assertion) is a TypeScript-only lie — at runtime, the middleware crashed before any route handler ran, and Next.js' generic error handler returned 500 with the unhelpful `Internal Server Error` body.

**Why it never showed before:** Chase's prior deploys were all to production. This was the first time a preview build had a request hit the proxy. Same break would happen on any branch — main, refactor, anything that triggers a preview deploy with no env vars set for that environment.

**The fix:** Two layers.

1. **Infrastructure** (the actual fix): add Supabase env vars to the Preview environment via Vercel dashboard or CLI:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL preview --value "$URL" --yes --scope iamchasewhittakers-projects
   vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY preview --value "$KEY" --yes --scope iamchasewhittakers-projects
   ```
   Recommend adding to Development scope too while you're there — covers Vercel CLI users running `vercel dev`.

2. **Code hardening** (so future drift is loud, not silent): replaced `process.env.NEXT_PUBLIC_SUPABASE_URL!` non-null assertions with explicit `requireSupabaseEnv()` checks in `proxy.ts`, `lib/supabase-server.ts`, and `lib/supabase-browser.ts`. They now throw a descriptive error naming which var is missing and in which `VERCEL_ENV` — so next time, the Vercel runtime log says `Missing Supabase env vars in preview. NEXT_PUBLIC_SUPABASE_URL=set, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=MISSING.` instead of nothing.

**Generalizable lesson:** TypeScript's `!` is a static promise, not a runtime check. For env vars that gate the entire app (auth keys, DB URLs, etc.), pay the 4 lines for an explicit check. If the value is undefined at runtime, you want the error message to *name the variable* — not punt to whichever line later trips over `undefined`. This applies to every portfolio app: the same fragile pattern exists in CRA apps (`REACT_APP_SUPABASE_URL`) and was avoided here only by luck.

**Also worth knowing — Vercel UX gotcha:** `vercel env ls` defaults to showing all environments but groups by name. The "environments" column says `Production` and nothing else for these two vars. It's easy to miss that they're not also on Preview unless you specifically look. There's no warning at deploy time that env vars exist for Production but not Preview.

---

## 2026-05-15 — Migrated `/login` from magic-link to email+password

**What happened:** Switched chase-hub to match the portfolio-wide auth standard set by ClarityOS-Money and just-shipped on YardOS (PR #7). Magic links were friction Chase didn't actually want for a personal admin gate — every post required leaving the app, opening an inbox, tapping a link. Password sign-in is one form, two fields, done.

**Pattern that worked:**
- Same shared Supabase project (`unqtnnxlltiadzbqpyhh`) means the user pre-created for YardOS / ClarityOS-Money is also valid here — no new dashboard work needed. **Auto Confirm User** flag was already set when the row was created.
- Kept the existing `<Suspense>` boundary because `useSearchParams` is still needed to read the `?next` redirect param (the proxy bounces unauthenticated `/admin` requests through `/login?next=/admin/…`).
- After successful `signInWithPassword`: `router.replace(next) + router.refresh()`. Beats `window.location.href` because it preserves React state and triggers a server-component revalidation in one shot. (YardOS uses `window.location.href` as a simpler fallback — both work; the `router` flavor is cleaner.)
- Local verification: `pnpm dev` → fill bad password → confirm Supabase returns "Invalid login credentials" (not "User not found"). That's the cheapest way to prove the form is wired to the right project without sharing real credentials.

**Generalizable lesson:** When the portfolio adopts a new convention (here: password auth across all admin gates), the migration shape is reusable. Read the most recently shipped example first (YardOS), copy its handler shape, then adapt only the parts that differ (here: the `next` query param + Suspense). Three apps, three migrations, ~30 lines diff each.

**What's intentionally left alone:** `src/app/auth/callback/route.ts` still exists. Password flow never hits it, but it's a working `exchangeCodeForSession` handler — if OAuth (GitHub, Google) is added later, the callback is ready. Deleting it would just mean writing it again.

**Email template housekeeping:** The Supabase Auth → Email Templates → "Magic Link" template can be deleted or repurposed; nothing in chase-hub sends OTP emails anymore.

---

## 2026-05-14 — Vercel `framework: null` silently 404s every route

**What happened:** After the Phase 4 deploy, every route on `chase-hub.vercel.app` returned `x-vercel-error: NOT_FOUND` despite a clean `next build` showing 11 routes generated and the deployment marked `Ready`.

**What I tried first (wrong):** Re-aliasing, redeploying with --prod, clearing cache, checking deployment protection. All dead ends — the underlying issue wasn't visible from CLI output.

**What actually surfaced it:** `mcp__vercel__get_project` returned `"framework": null`. The Vercel edge router needs to know what framework you're running to assemble Next.js dynamic/static routes. With `framework=null`, the edge has the build artifacts but doesn't know to serve them. So every route → NOT_FOUND.

**Why it happened:** The portfolio integration move (chase-hub → `chase/portfolio/chase-hub`) put a `pnpm-workspace.yaml` in the parent tree. Vercel's auto-detection got confused and stopped reporting the framework.

**The fix:** A 4-line `vercel.json` pinning `"framework": "nextjs"`. Per-build override; doesn't depend on dashboard settings.

**Generalizable lesson:** When prod 404s on every route but local build is clean and deployment status is Ready, **suspect framework detection before suspecting code**. The diagnostic command is `get_project` (via Vercel MCP) checking the `framework` field. Two-minute fix once you know.

**Also worth knowing:** `vercel.json` overrides project-level settings per build. So this works without touching the dashboard. If you later open Vercel's UI, you can still see `framework: null` at the project level — that's fine; `vercel.json` wins per deploy.

---

## 2026-05-13 — AI SDK v6 broke `useChat` in non-obvious ways

**What happened:** Started writing the Troubleshooter component using `useChat` from memory. Every API call I tried failed type-checking or runtime.

**What was actually true (verified via `node_modules/ai/docs/04-ai-sdk-ui/02-chatbot.mdx`):**

| What I expected (v5 era) | What v6 actually requires |
|---|---|
| `import { useChat } from 'ai/react'` | `import { useChat } from '@ai-sdk/react'` |
| Auto-discovers `/api/chat` | Explicit `transport: new DefaultChatTransport({ api: '/api/chat' })` |
| `handleInputChange` + `handleSubmit` from the hook | Manage `input` state yourself, call `sendMessage({ text: input })` |
| `messages.map(m => m.content)` (flat string) | `messages.map(m => m.parts.map(p => p.type === 'text' ? p.text : null))` |
| Server route: `result.toAIStreamResponse()` | Server route: `result.toUIMessageStreamResponse()` |
| `isLoading: boolean` | `status: 'ready' | 'submitted' | 'streaming' | 'error'` |

**Generalizable lesson:** The `ai` package bundles its own docs at `node_modules/ai/docs/`. Always grep there first. The skill `/vercel:ai-sdk` says it explicitly: "Everything you know about the AI SDK is outdated or wrong." That's not a joke.

**Also worth knowing:** Model IDs drift too. Always run `curl -s https://ai-gateway.vercel.sh/v1/models | python3 -c "..."` (or `jq` if installed) before hard-coding a model string. Sonnet 4.6 was the latest at ship time, 4.5 was already obsolete.

---

## 2026-05-13 — Next.js 16 renamed `middleware.ts` to `proxy.ts`

**What happened:** Was about to write `src/middleware.ts` for the Supabase session refresh. AGENTS.md says Next 16 has breaking changes; I checked `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` first.

**The find:** "Starting with Next.js 16, Middleware is now called Proxy to better reflect its purpose. The functionality remains the same."

- File: `proxy.ts` (not `middleware.ts`)
- Export: `proxy` (not `middleware`)
- The build output still labels it `ƒ Proxy (Middleware)` — legacy naming in the summary

**Also async-params drift:** Dynamic route handlers receive `ctx.params` as a `Promise<{ id: string }>`. Pattern: `const { id } = await ctx.params`. There's a typed helper: `RouteContext<'/posts/[id]'>`.

**Generalizable lesson:** AGENTS.md's warning about breaking changes was literal. Take 90 seconds to grep `node_modules/<framework>/dist/docs/` before writing routing/handler code in any framework whose major version is newer than your training data.

---

## 2026-05-13 — `useSearchParams` requires a `Suspense` boundary for prerendering

**What happened:** First production build for Phase 2 failed at `/login` with:
```
useSearchParams() should be wrapped in a suspense boundary at page "/login". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
```

**Why:** Next.js prerenders client pages at build time. If a component reads URL query params via `useSearchParams`, the prerender bails out unless that subtree is inside a `<Suspense>` — Suspense tells Next "this part can stream in later." Without it, the whole page can't be statically optimized.

**The fix:** Split `LoginPage` into a thin wrapper + `LoginForm` body, wrap the body in `<Suspense fallback={<LoginFallback />}>`. Now `/login` ships as `○ Static` (the wrapper) and the form streams in at request time.

---

## 2026-05-13 — Two layers of auth: `proxy.ts` UX gate + RLS DB gate

**Pattern that worked:** For single-admin sites that share a Supabase project with other apps:

1. **`proxy.ts`** redirects non-admins away from `/admin` before they see anything.
2. **RLS policies** scoped to a specific JWT email (`auth.jwt() ->> 'email' = 'chase.t.whittaker@gmail.com'`) reject writes at the DB level — even if someone forged a session and called the API directly, Postgres says no.

**Why both:** UI redirect is for UX. RLS is for security. If you only have one, you're vulnerable. The combination costs zero extra effort and is impossible to forget once it's in place.

**Generalizable lesson:** When you're on a shared Supabase project (the `unqtnnxlltiadzbqpyhh` shared portfolio project), `auth.role() = 'authenticated'` is NOT a real auth check — any authenticated user from any portfolio app would pass. Always scope by email or user-id at the RLS layer.

---

## 2026-05-13 — `next/og` ImageResponse has hard constraints

**Constraints I hit:**

1. **Only `display: flex` or `display: none`.** No `block`, no `grid`. The underlying renderer (Satori) is a subset of CSS. Every container needs explicit `display: flex`.
2. **No Tailwind, no CSS files.** Inline `style={{ ... }}` only. Design tokens have to be hardcoded as JS constants in the OG file. They drift from `globals.css` — flag this in the file's header comment.
3. **No external images** unless you fetch them as `ArrayBuffer` first.
4. **Fonts must be loaded explicitly** via `fonts: [{ name, data, style, weight }]` in `ImageResponse` options. System fonts work for simple cards.

**Worked example:** `src/app/opengraph-image.tsx`. Build outputs `ƒ /opengraph-image` (dynamic — but that's fine; the response is cacheable at the CDN layer).

---

## 2026-05-12 — lucide-react v1.14.0 missing brand icons

**What happened:** Imported `{ Github, Linkedin, Mail } from "lucide-react"` in `SiteFooter.tsx`. Build said both `Github` and `Linkedin` were missing exports — the error was helpful: "Did you mean to import Gift?".

**Why:** lucide-react v1.x removed several brand icons that were in v0.x. The package is intentionally restrictive about which trademarks/logos it ships.

**The fix:** Use text labels ("GitHub", "LinkedIn") + a neutral `ExternalLink` icon. Better visually anyway — brand-mark icons in a footer felt heavy.

**Generalizable lesson:** Don't assume icon libraries are stable across major versions. Spot-check icon imports against the actual installed version when scaffolding.

---

## 2026-05-12 — JPEG screenshot compression hides white-on-white UI

**What happened:** Took preview screenshots of the social proof cards. Cards rendered as effectively-invisible against the `#FAFAF8` background despite working perfectly in the DOM.

**Why:** Preview tool returns JPEG. JPEG compression flattens subtle low-contrast UI. The cards had `bg-surface (#FFFFFF)` against `--background (#FAFAF8)` — a 5/255 difference. DOM was correct; the screenshot just couldn't represent it.

**The fix:** When visually verifying subtle palette UI, use `preview_inspect` with computed styles, not screenshots. Screenshots are great for layout; bad for color subtleties.

**Other fix that resolved the actual design issue:** Set the social proof *section* background to `#F1F5F9` (light blue-gray) so the white cards have real contrast. This is the only hardcoded color outside the design tokens.

## 2026-05-21

Added `docs/PRD.md` per portfolio-wide PRD audit. Template: LEAN_PRD.md (active/parked) or ARCHIVE_RETRO_PRD.md (archived). All 51 projects now have PRDs at `docs/PRD.md`. Templates live at `~/Developer/chase/prd-templates/`. Plan: `~/.claude/plans/apps-have-a-prd-serialized-acorn.md`.
