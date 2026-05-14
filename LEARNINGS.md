# Learnings — chase-hub

Per-project lessons. New entries go at the top.

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
