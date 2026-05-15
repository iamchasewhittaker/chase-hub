# Changelog

All notable changes to chase-hub. Format roughly follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed
- **Auth:** switched `/login` from email magic link (`signInWithOtp`) to email + password (`signInWithPassword`). Matches the portfolio standard now set by ClarityOS-Money and YardOS. Single-step form, no inbox round-trip, Safari/Keychain autofill via `autoComplete="email"` + `autoComplete="current-password"`. Post-login redirects to `?next` (defaults to `/admin`) via `router.replace + router.refresh`. The admin gate at `proxy.ts` (ADMIN_EMAIL constraint) is unchanged. The Supabase Auth template "Magic Link" can be deleted or repurposed.
- `src/app/auth/callback/route.ts` is retained but no longer in the password flow — kept for any future OAuth wiring.

### Fixed
- **Preview deploys no longer silently 500.** Replaced `process.env.NEXT_PUBLIC_SUPABASE_*!` non-null assertions in `proxy.ts`, `lib/supabase-server.ts`, and `lib/supabase-browser.ts` with explicit `requireSupabaseEnv()` checks that throw a descriptive error naming which var is missing. The Supabase env vars were configured for Production only, so the first preview deploy crashed inside the middleware with a generic Internal Server Error. Adding env vars to Preview (Vercel dashboard) fixes the deploy; the new error message makes the next gap loud instead of silent.

---

## 2026-05-14 — Phase 4: Polish + SEO

### Added
- `src/app/opengraph-image.tsx` — generates 1200×630 OG card using `next/og` ImageResponse. Warm light palette, "CHASE WHITTAKER" eyebrow, accent-blue tagline split, credentials + URL footer.
- `src/app/sitemap.ts` — types via `MetadataRoute.Sitemap`. Lists `/` and `/payments`. Auth-gated routes excluded.
- `src/app/robots.ts` — disallows `/admin`, `/login`, `/auth/`, `/api/`. References `/sitemap.xml`.
- Full OG + Twitter meta in `src/app/layout.tsx` (`metadataBase`, `openGraph`, `twitter`, `robots`, keywords, authors).
- `@vercel/analytics` + `@vercel/speed-insights` mounted in root layout.
- Keyboard navigation on payment flow: `←/→/↑/↓` step through, `Home`/`End` jump to ends, `Esc` close detail. `role="group"` + `aria-label` on the step container.
- Keyboard-hint footnote on `/payments` (visible only at `sm:` width and above).
- `vercel.json` declaring `"framework": "nextjs"` — required because the parent `pnpm-workspace.yaml` confuses Vercel auto-detection.

### Changed
- Voice copy pass: cleared em-dashes from all Chase-authored copy (payment-steps explanations, project descriptions, page titles, admin UI, OG alt). Friend-quote verbatim is preserved.
- Title separator: em-dash → pipe (`Chase Whittaker | Payments Expert & Builder`, `How a Payment Works | Chase Whittaker`).

### Fixed
- Production 404s on every chase-hub.vercel.app route after the Phase 4 deploy. Root cause: Vercel project metadata reported `framework: null` (likely from monorepo move). Vercel build succeeded but the edge router couldn't route Next.js dynamic/static output. Fix: `vercel.json` with explicit framework declaration.

---

## 2026-05-13 — Phase 3: AI Integration Troubleshooter

### Added
- `src/app/api/chat/route.ts` — `streamText` via Vercel AI Gateway (`anthropic/claude-sonnet-4.6`), `convertToModelMessages`, `toUIMessageStreamResponse`.
- `src/components/Troubleshooter.tsx` — uses `useChat` from `@ai-sdk/react` + `DefaultChatTransport`. Collapsible panel, message bubbles, streaming, char counter, rate limit (20 messages/session via localStorage).
- `src/lib/troubleshooter-prompt.ts` — system prompt scaffold defining the troubleshooter's role, conversational rules, and a TODO section for Chase's top-5 integration failure patterns.
- AI SDK packages: `ai`, `@ai-sdk/react`. Models routed through Vercel AI Gateway (OIDC in prod, `AI_GATEWAY_API_KEY` for local dev).
- Troubleshooter mounted on `/payments` below the visualization.

---

## 2026-05-13 — Phase 2: Supabase-backed feed + admin composer

### Added
- Supabase migration: `chase_hub_posts` table with `post_status` enum (`draft`/`published`/`deleted`), email-scoped RLS policies, auto-bump `updated_at` trigger. Table prefixed `chase_hub_` to avoid collision with the shared portfolio Supabase project.
- `src/lib/supabase-server.ts` — `createServerClient` (cookies-aware), `getChaseEmailFromSession`, `isAdmin`.
- `src/lib/supabase-browser.ts` — `createBrowserClient` factory.
- `src/proxy.ts` (Next 16 rename of `middleware.ts`) — refreshes session, gates `/admin`, redirects authenticated users away from `/login`.
- API routes: `GET/POST /api/posts`, `PATCH/DELETE /api/posts/[id]` with auth gating and validation.
- `/login` page with `Suspense`-wrapped magic-link form (`useSearchParams` needs the boundary).
- `/auth/callback` route handler exchanging the magic-link code for a session.
- `/admin` server page composing `BalanceWidget`, `AdminClient` (client wrapper for editing state), `PostComposer`, `DraftList`, `SignOutButton`.
- `FeedSection` (server component) on the homepage between social proof and portfolio. Renders nothing if zero published posts.
- `FeedPost` card with `accent/10` topic pill + relative time (`formatRelativeTime` switches to absolute after 7 days).
- Editorial guards (client-side): money warn, full-name warn, sensitive-names + profanity hard block.
- 70/30 professional/personal ratio: `BalanceWidget` on admin (last-30-day score, amber when over target) + inline composer nudge with "Save as draft / Publish anyway" buttons when publishing a personal post would push the last-10 ratio past 30%. No hard cap.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set locally and in Vercel.

---

## 2026-05-13 — Portfolio integration move

### Changed
- Moved entire repo from `/Users/chase/Developer/chase-hub` to `/Users/chase/Developer/chase/portfolio/chase-hub`. Atomic mv carries `.git/`, `.vercel/`, `.claude/`, `node_modules/`, `.next/` intact.
- Parent `.claude/launch.json` updated to point at the new path.
- Created `STATE.md` at the new location following the portfolio convention.

---

## 2026-05-12 — Phase 1: Static site + Payment Flow visualization

### Added
- Next.js 16 + TypeScript + Tailwind v4 (`@theme inline`) + Framer Motion + lucide-react + pnpm scaffold.
- `src/app/globals.css` warm-light design tokens: `--background #FAFAF8`, `--surface #FFFFFF`, `--accent #2563EB`, `--muted #6B7280`, `--border #E5E7EB`, `--success #16A34A`.
- `Hero`, `SocialProof` (4 friend quotes from `lib/quotes.ts`), `PortfolioSection` (3 apps: GMAT Mastery, ClarityOS Money, YardOS), `SiteHeader`, `SiteFooter`.
- `/payments` page: `PaymentFlow` orchestrator + `FlowNode` + `FlowConnector` + `StepDetail`. 8-step visualization with Framer Motion staggered entry (`index * 0.12` delay), 4-column desktop grid / vertical mobile layout, click-to-expand detail panel.
- `src/lib/payment-steps.ts` — 8 payment steps with Chase's domain knowledge as starting content (drafted; awaiting Chase's enhancement pass).
- Deployed to Vercel + linked to `https://chase-hub.vercel.app`.

### Known gotchas captured
- lucide-react v1.14.0 doesn't export `Github` or `Linkedin`. Footer uses text labels + `ExternalLink`.
- Social proof section background `#F1F5F9` (hardcoded) so white cards have contrast.
