# Chase Hub — Handoff

**Date:** 2026-05-13  
**Phase:** 1 complete, starting Phase 2  
**Repo:** https://github.com/iamchasewhittaker/chase-hub  
**Live:** https://chase-hub.vercel.app  
**Path:** `/Users/chase/Developer/chase/portfolio/chase-hub`

---

## What's built (Phase 1 ✅)

A personal professional hub.

| Section | File | Status |
|---------|------|--------|
| Hero | `src/components/Hero.tsx` | ✅ Live |
| Social proof (4 quotes) | `src/components/SocialProof.tsx` + `src/lib/quotes.ts` | ✅ Live |
| Portfolio (3 apps) | `src/components/PortfolioSection.tsx` + `src/lib/projects.ts` | ✅ Live |
| Payment flow (8 steps, animated) | `src/components/PaymentFlow.tsx` + `src/lib/payment-steps.ts` | ✅ Live |
| Footer | `src/components/SiteFooter.tsx` | ✅ Live |
| Header | `src/components/SiteHeader.tsx` | ✅ Live |

### Stack
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 (`@theme inline` tokens)
- Framer Motion (staggered SVG flow animation)
- lucide-react v1.14.0 (note: `Github`/`Linkedin` icons don't exist — use `ExternalLink` instead)
- pnpm

### Design tokens (globals.css)
- Background: `#FAFAF8` (warm off-white)
- Surface: `#FFFFFF`
- Accent: `#2563EB` (blue)
- Muted: `#6B7280`
- Border: `#E5E7EB`
- Social proof section bg: `#F1F5F9` (hardcoded, not a token — needed contrast against white cards)

### Key fix to remember
lucide-react v1.14.0 doesn't export `Github` or `Linkedin`. SiteFooter uses text labels ("GitHub", "LinkedIn") + `ExternalLink` icon instead.

---

## What's next (Phase 2 — Feed with Supabase)

**Decisions locked via interview on 2026-05-13.** Do not re-litigate these in implementation.

**Goal:** Chase logs in on his phone, writes a short thought, picks a topic, hits publish. Appears on the homepage as the latest of the last 5 posts. He can also save a draft, edit a published post, or delete one.

### Locked spec

| Decision | Value |
|----------|-------|
| Posting cadence | 2-3 times/week (target, no enforcement) |
| Topic tags (6) | `payments`, `ai`, `product`, `sales`, `career`, `life` |
| Homepage display | Latest 5 posts, no topic filter (filter is deferred to Phase 4 if ever) |
| Post length | Soft target ~500 chars. Composer shows a counter, does NOT block submit. |
| Post style | Card with topic pill + date. Matches Phase 1 portfolio card pattern (`rounded-xl border border-border bg-surface p-6 shadow-sm`) |
| Date format | Relative ("2 hours ago", "3 days ago"). Switch to absolute ("May 13, 2026") after 7 days. |
| Edit | Yes, anytime. No "edited" indicator unless Chase asks for one later. |
| Drafts | Yes. Save without publishing. Composer has a Save Draft / Publish split button. |
| Delete | Yes. Soft delete (set `status = 'deleted'`). Hidden from public feed but recoverable. |
| Scheduling | NOT in Phase 2. Defer indefinitely — at 2-3/week cadence, scheduling earns nothing. |
| Editorial guards | 3 client-side checks in composer (see below) |

### Editorial guards (client-side, in PostComposer)

All three run before submit. None block the API — they're UX safeguards only:

1. **Warn (soft, dismissible):** post contains a dollar sign, "salary", or specific dollar amounts (regex like `\$[\d,]+` or `\b\d{2,3}k\b`).
2. **Warn (soft, dismissible):** post contains two capitalized words in a row that look like a full name (e.g., `\b[A-Z][a-z]+ [A-Z][a-z]+\b`). Allow dismiss because false positives like "New York" or "Square Inc" are common.
3. **Block (hard, must edit to proceed):** post contains profanity, slurs, or any name from `src/lib/sensitive-names.ts` (a small array Chase maintains). Block lookup is case-insensitive substring match.

### Professional / personal ratio guardrail

**Why:** The site exists to position Chase professionally. The personal tags (career, life) were added because being human matters, but if "life" and "career" dominate the feed, hiring managers won't see the payments / AI / product expertise. This guardrail keeps the ratio honest without removing Chase's agency.

**Categories (defined in `src/lib/tag-categories.ts`):**
```ts
export const PROFESSIONAL_TAGS = ['payments', 'ai', 'product', 'sales'] as const;
export const PERSONAL_TAGS = ['career', 'life'] as const;
export const TARGET_PERSONAL_RATIO = 0.30; // 70/30 split, max 30% personal
```

**Mechanism 1 — Visibility (admin dashboard widget):**

Component: `BalanceWidget.tsx` rendered at the top of `/admin/page.tsx`.

- Query: last 30 days of `status='published'` posts, count by category
- Display:
  ```
  Last 30 days · 7 professional · 3 personal · 70/30 ✓
  ```
- Color: text-success (green) if ratio is at or below 30% personal; text-amber-600 if above
- Always visible to Chase when logged in. No popup, no nag — just a quiet score.

**Mechanism 2 — Soft nudge at publish (composer-level):**

When Chase clicks Publish on a post tagged `career` or `life`:

1. Query: last 10 published posts, count personal vs professional
2. Calculate hypothetical: what would the ratio be if this post publishes?
3. If hypothetical exceeds 30% personal, render an inline message inside the composer (NOT a modal — modals are banned per the design rules):

   ```
   Heads up — 4 of your last 10 posts would be personal after this.
   Want to draft a payments / ai / product / sales one first?
   [ Save as draft instead ]   [ Publish anyway ]
   ```

4. Both buttons are real actions. "Save as draft instead" sets `status='draft'` and clears the composer. "Publish anyway" proceeds with the publish. No additional confirmation.

**No hard cap.** Chase explicitly rejected this on 2026-05-13 — hard caps create pressure to write low-quality professional posts as "unlock tokens" to bypass the block. Visibility + nudge is the entire enforcement layer.

**Edge cases:**
- Fewer than 10 total published posts → skip the nudge calculation, no warning shown (not enough signal)
- Editing an existing post that's already published → no nudge (the ratio already includes it)
- Drafts don't count toward the ratio (only `status='published'`)

### Supabase schema (LIVE — migration applied 2026-05-13)

The table is named **`chase_hub_posts`** (not `posts`) because the shared
Supabase project hosts many portfolio apps; the prefix prevents collisions.

```sql
create type post_status as enum ('draft', 'published', 'deleted');

create table chase_hub_posts (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  topic text not null check (topic in ('payments', 'ai', 'product', 'sales', 'career', 'life')),
  status post_status not null default 'published',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index chase_hub_posts_status_created_idx on chase_hub_posts (status, created_at desc);

-- RLS: anyone reads published posts. ONLY Chase's email can write or read
-- non-published rows. Email-scoped (not just `authenticated`) because the
-- shared project has other portfolio apps and we don't want their users to
-- write here.
alter table chase_hub_posts enable row level security;

create policy "chase_hub_posts_public_read"
  on chase_hub_posts for select
  to anon, authenticated
  using (status = 'published');

create policy "chase_hub_posts_admin_all"
  on chase_hub_posts for all
  to authenticated
  using ((auth.jwt() ->> 'email'::text) = 'chase.t.whittaker@gmail.com')
  with check ((auth.jwt() ->> 'email'::text) = 'chase.t.whittaker@gmail.com');

-- Trigger: bump updated_at on every UPDATE.
create or replace function chase_hub_bump_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

create trigger chase_hub_posts_updated_at
  before update on chase_hub_posts
  for each row execute function chase_hub_bump_updated_at();
```

### Files (as built)

Two deviations from the original spec, both forced by Next.js 16:
- `middleware.ts` → `proxy.ts` (Next 16 renamed it)
- Dynamic route params come from `await ctx.params` (now async)

```
src/
  proxy.ts                      # Session refresh + /admin gate (Next 16 rename of middleware.ts)
  app/
    admin/
      page.tsx                  # Server: fetches drafts + recent + topics
      AdminClient.tsx           # Client wrapper: owns editing state
      SignOutButton.tsx         # Tiny client button → supabase.auth.signOut()
    login/
      page.tsx                  # Magic-link form (Suspense-wrapped — useSearchParams requires it)
    auth/
      callback/route.ts         # GET — exchanges magic-link code for a session, redirects to ?next
    api/
      posts/
        route.ts                # GET (public, ?status, ?recent, ?limit) + POST (auth)
        [id]/route.ts           # PATCH + DELETE (auth, soft delete via status='deleted')
  components/
    FeedSection.tsx             # Server component, fetches latest 5 published posts
    FeedPost.tsx                # Card: topic pill (top-left), relative date (top-right), content
    PostComposer.tsx            # Textarea + topic dropdown + char counter + 2 buttons + inline ratio nudge
    DraftList.tsx               # Admin-only list of drafts and recent-published (with edit/publish/delete)
    BalanceWidget.tsx           # Admin-only dashboard widget showing last-30-day pro/personal ratio
  lib/
    supabase-server.ts          # createServerClient (cookies-aware) + getChaseEmailFromSession + isAdmin
    supabase-browser.ts         # createBrowserClient
    relative-time.ts            # "2 hours ago" formatter, switches to absolute after 7d
    sensitive-names.ts          # SENSITIVE_TERMS + PROFANITY — Chase maintains the names list
    editorial-checks.ts         # Pure: checkMoney, checkName, checkBlocked, runEditorialChecks
    tag-categories.ts           # PROFESSIONAL_TAGS, PERSONAL_TAGS, ALL_TAGS, TARGET_PERSONAL_RATIO
    ratio-check.ts              # Pure: checkRatio(recentTopics, incomingTopic) → RatioCheck
```

### Homepage change

Insert `<FeedSection />` in `src/app/page.tsx` between `<SocialProof />` and `<PortfolioSection />`.

`FeedSection`:
- Server component
- Renders nothing if zero posts (Phase 2 ships with no posts — Chase fills it)
- Otherwise renders an `<h2>` matching the social proof style (`text-sm font-semibold uppercase tracking-widest text-muted`), then a 1-column list of `<FeedPost />` cards

### Env vars

Add to `.env.local` AND Vercel (production + preview):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # only needed if doing admin operations server-side
```

### Auth scope

- Magic link to `chase.t.whittaker@gmail.com` ONLY
- Session: default Supabase session length (1 hour access token, 1 week refresh)
- `/admin` and `/api/posts/[id]` (PATCH/DELETE) require auth — `middleware.ts` redirects to `/login` if no session
- `/api/posts` POST requires auth — return 401 if no session

### Done when

1. Chase visits `/login` from his phone, enters his email, gets a magic link in Gmail, clicks it, lands on `/admin`.
2. Types a post, picks topic, sees the char counter, optionally sees an editorial warning, hits Publish.
3. Post appears on `chase-hub.vercel.app` homepage as a card with topic pill + "just now".
4. Comes back later, sees his draft from yesterday in DraftList, edits and publishes it.
5. Decides to pull an old post, hits delete, it disappears from the homepage.

---

## Phase 3 preview (AI Troubleshooter)

After feed is live:
- Install `ai` + `@ai-sdk/anthropic`
- `src/app/api/chat/route.ts` — streaming AI endpoint
- `src/components/Troubleshooter.tsx` — collapsible panel using `useChat`
- **Chase writes the system prompt** (this is his 6-year domain knowledge)
- Rate limit: localStorage counter, ~20 messages/session

---

## Brand & Design — DO NOT CHANGE THIS

The design is locked. Chase explicitly approved it. Do not redesign, re-theme, or "improve" it.

### Color palette (full reference)

| Token | Hex | Tailwind class | Use |
|-------|-----|----------------|-----|
| Background | `#FAFAF8` | `bg-background` | Page background — warm off-white, not pure white |
| Surface | `#FFFFFF` | `bg-surface` | Cards, panels, header |
| Foreground | `#1A1A1A` | `text-foreground` | Primary body text |
| Muted | `#6B7280` | `text-muted` | Secondary text, labels, captions |
| Accent | `#2563EB` | `text-accent`, `bg-accent` | Blue — CTA buttons, active states, key highlights |
| Accent hover | `#1D4ED8` | `hover:bg-accent-hover` | Darker blue on hover |
| Success | `#16A34A` | `text-success` | "Approved" green (reserved for payment status) |
| Border | `#E5E7EB` | `border-border` | All dividers, card borders |
| Section contrast | `#F1F5F9` | `bg-[#F1F5F9]` | Social proof section — hardcoded, not a token |

### Typography
- **Font:** Inter (Google Fonts, loaded via `next/font/google`, variable `--font-inter`)
- **Hero H1:** `text-4xl font-bold sm:text-5xl` — first line dark, second line in accent blue
- **Section labels:** `text-sm font-semibold uppercase tracking-widest text-muted`
- **Card headings:** `text-lg font-semibold`
- **Body:** `text-sm leading-relaxed`
- **Learned/italic text:** `text-sm italic text-muted`
- No custom font sizes — use Tailwind's scale only

### Layout conventions
- **Max content width:** `max-w-5xl mx-auto px-6` on all sections
- **Section vertical padding:** `py-16` standard, `py-24 sm:py-32` for hero
- **Card style:** `rounded-xl border border-border bg-surface p-6 shadow-sm`
- **Grid:** `grid-cols-1 sm:grid-cols-2` for 2-up, `grid-cols-1 sm:grid-cols-3` for 3-up
- **Payment flow desktop:** `grid grid-cols-4 gap-3` (intentional 4x2 for 8 steps)

### Buttons
- **Primary CTA:** `bg-accent hover:bg-accent-hover text-white rounded-lg px-5 py-2.5 text-sm font-medium`
- **Secondary/ghost:** `border border-border text-muted hover:border-accent hover:text-accent rounded-lg px-3 py-2 text-sm`
- Arrow icon (`→`) on primary CTAs via `ArrowRight` from lucide-react

### Payment flow nodes (FlowNode)
- Default: light blue icon circle, gray border, muted text
- Active: `border-accent bg-accent/5`, filled blue icon circle
- Animation: Framer Motion, `initial={{ opacity: 0, y: 16 }}`, stagger delay `index * 0.12`
- Connector lines: animated `scaleX` / `scaleY` with `originX`/`originY: 0`

### Voice rules (copy tone)
- Warm, direct, no hype
- No em-dashes (—) in copy
- No consultant phrasing ("leverage", "synergy", "robust")
- Specific over vague — say "Authorize.Net and CyberSource", not "payment platforms"
- Short sentences. One idea at a time.

### What NOT to add
- No dark mode
- No gradients
- No decorative shapes, blobs, or background patterns
- No hero image or avatar photo
- No animations beyond the payment flow stagger
- No modal dialogs
- No toast notifications (use inline state instead)

---

## Domain
`chasewhittaker.com` still needs to be registered and connected in Vercel project settings.

---

## Dev server
```bash
cd /Users/chase/Developer/chase-hub
pnpm dev --port 3011
```
Or via Claude Code preview: name `chase-hub` in `.claude/launch.json`.

## Deploy
Push to `main` → auto-deploys to Vercel (GitHub connected).
