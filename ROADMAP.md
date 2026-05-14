# Roadmap — chase-hub

## Status

All four original phases shipped (2026-05-12 → 2026-05-14). Site is interview-ready and shareable. Live at https://chase-hub.vercel.app.

## What's next (Chase's call)

These are the spots where the product needs Chase, not more engineering. Pick whichever feels right next.

### Content (highest leverage — the product speaks)
- **First real feed post.** From your phone. Validates the magic-link flow + composer + ratio guardrail end-to-end. Any topic; brevity is fine.
- **Pass on `src/lib/payment-steps.ts`.** Each of the 8 step explanations is a starter draft. Replace with your specific merchant-implementation nuance — the kind of detail only someone who's helped 200+ merchants go live would write.
- **Fill in `src/lib/troubleshooter-prompt.ts`.** There's a `TODO — top 5 most common patterns` block. That's the system prompt's spine. Write the 5 patterns in your own words; everything else flows from it.

### Domain
- **Register `chasewhittaker.com`.** Connect via Vercel project settings → Domains. Update `metadataBase` in `src/app/layout.tsx` from `chase-hub.vercel.app` to the new origin. Update `BASE_URL` constants in `sitemap.ts` and `robots.ts`.

### SEO follow-through
- **Submit sitemap to Google Search Console** once the domain is live. URL: `https://chasewhittaker.com/sitemap.xml`.
- **Add structured data (Person schema)** to the homepage so Google can populate a knowledge panel. Single `<script type="application/ld+json">` in `layout.tsx`.

### Polish (nice-to-have, not blocking)
- **Better OG variations per route.** `/payments` could have its own opengraph-image.tsx with a payment-flow snippet visual.
- **Edit indicator** in the feed: show a small "edited" tag if `updated_at > created_at + 1 minute`.
- **Topic filter pills** above the homepage feed (originally scoped, then explicitly de-scoped — could come back if you write a lot).
- **Connect domain → Linear project**: log the launch as a Linear issue under WHI for portfolio governance.

## What's intentionally NOT on the roadmap

These were considered and rejected by the design rules; don't reintroduce without a deliberate decision:

- ❌ Dark mode toggle. Warm light only.
- ❌ Hero image or avatar photo.
- ❌ Comments on feed posts.
- ❌ Visitor account / sign-up. Admin = Chase only.
- ❌ Long-form blog post page. The feed IS the writing surface.
- ❌ Contact form. GitHub + LinkedIn + Email in the footer.
- ❌ Hard cap on the ratio nudge (rejected explicitly 2026-05-13 — caps create "unlock token" pressure).
- ❌ Scheduled publishing. Defer indefinitely at 2-3 posts/week.

## Reflection

Originally scoped as a 4-week plan. Shipped end-to-end in 2.5 days (2026-05-12 → 2026-05-14). The biggest single time sink was the Phase 4 prod 404 outage, which was a Vercel framework-detection issue and not a code bug.

The site is timidity-proof by design: the product speaks. Now Chase has to feed it.
