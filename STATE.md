# State — chase-hub

> Last updated: 2026-05-14 via /portfolio refresh.

## Current Phase
Ship (Step 6 of 6-step framework). **Phases 1–4 all SHIPPED.** Live in production. Awaiting first real-content posts + optional custom domain.

## Status
Next.js 16 App Router + TypeScript + Tailwind v4 + Framer Motion + Supabase + Vercel AI Gateway + pnpm.
**Production:** https://chase-hub.vercel.app (future: chasewhittaker.com).

| Phase | What | Status |
|-------|------|--------|
| 1 | Hero, Social Proof, Portfolio, 8-step Payment Flow with click-to-expand | ✅ Live |
| 2 | Supabase feed (chase_hub_posts) + magic-link admin + ratio guardrail (70/30) + editorial checks + drafts/edit/soft-delete | ✅ Live |
| 3 | AI Integration Troubleshooter on /payments via Vercel AI Gateway (Claude Sonnet 4.6) + localStorage rate-limit (20 msg/session) | ✅ Live |
| 4 | OG image (1200×630), sitemap.xml, robots.txt, Vercel Analytics + Speed Insights, keyboard nav on payment flow, voice copy pass (em-dashes cleared) | ✅ Live |

## Active Work
None. Awaiting Chase's first real posts and his pass on `lib/payment-steps.ts` (domain enhancements).

## Blockers
None.

## Last Meaningful Activity
- 2026-05-14 — Phase 4 shipped. Root cause analysis on the prod-404 outage: Vercel auto-detection reported `framework: null` after the portfolio move, edge router silently returned NOT_FOUND for every route despite clean builds. Fixed with explicit `vercel.json` framework pin.
- 2026-05-13 — Phase 2 shipped (Supabase feed + admin + ratio guardrail) and Phase 3 shipped (AI troubleshooter on `/payments`).
- 2026-05-13 — Portfolio integration: moved from `~/Developer/chase-hub` to `chase/portfolio/chase-hub`.
- 2026-05-12 — Phase 1 shipped: 8-step animated payment flow, hero, social proof, portfolio.

## Next Steps
- **[Chase writes]** First real post on the feed from his phone (validates the magic-link + composer flow end-to-end).
- **[Chase writes]** Review and enhance `src/lib/payment-steps.ts` with his merchant-implementation expertise (the 8 step explanations).
- **[Chase writes]** Review and personalize `src/lib/troubleshooter-prompt.ts` — fill in the "top 5 reasons integrations fail" TODO with his real experience.
- **Optional**: Register `chasewhittaker.com` and connect in Vercel project settings.
- **Optional**: Submit `https://chase-hub.vercel.app/sitemap.xml` to Google Search Console.

## References
- HANDOFF.md (this directory) — full design tokens, Supabase schema, AI provider config, voice rules
- LEARNINGS.md (this directory) — cross-session gotchas and lessons (Next 16 renames, framework=null, AI SDK v6 changes)
- CHANGELOG.md (this directory) — what shipped, in order
- ROADMAP.md (this directory) — what's next, optional polish
- Production: https://chase-hub.vercel.app
- GitHub: https://github.com/iamchasewhittaker/chase-hub
- Vercel project: `iamchasewhittakers-projects/chase-hub`
- Supabase project: `unqtnnxlltiadzbqpyhh` (shared with portfolio), table `chase_hub_posts`
- Dev: `pnpm dev --port 3011` (or preview name `chase-hub` in `.claude/launch.json`)
