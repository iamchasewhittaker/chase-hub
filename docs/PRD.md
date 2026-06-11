# chase-hub — PRD

**Status:** active · **Lane:** behavioral · **Last updated:** 2026-05-21
**Live:** https://chase-hub.vercel.app

---

## Problem

12+ months into a job search at payments-adjacent companies, Chase's résumé doesn't show payments depth — that he actually understands merchant onboarding, 3DS, decline cascades, integration failure modes. LinkedIn flattens him into the same feed as everyone else; Substack is overkill for short, frequent thinking. He needs a fast personal hub that proves payments depth, doubles as an always-on portfolio, and forces a weekly publishing habit.

## Users

- **Primary:** Any professional landing on the site — hiring managers, recruiters, payments engineers, generalist readers from LinkedIn or a résumé link. The hub serves them all.
- **Secondary:** Chase himself, using the admin + composer flow from his phone to publish without a laptop ritual.

## User stories

- As a hiring manager, I want to land on chase-hub and within 10 seconds see Chase's role, the 8-step payments flow he's lived, and a recent thought.
- As Chase, I want to publish a short post from my phone in under 2 minutes so the 1-post/week floor doesn't require sitting down at a desk.
- As a payments engineer, I want a working integration troubleshooter so I get value from the site even if I'm not hiring.
- As Chase, I want the feed to enforce a 70/30 voice ratio (signal / personal) so I don't drift into oversharing.
- As Chase, I want soft-delete + edit on posts so a bad first published post isn't permanent.

## V1 features

- **Hero + Social Proof + Portfolio + 8-step Payment Flow** with click-to-expand explanations
- **Feed** backed by `chase_hub_posts` Supabase table: composer, drafts, edit, soft-delete, 70/30 ratio guardrail, editorial checks
- **AI Integration Troubleshooter** on `/payments` via Vercel AI Gateway (Claude Sonnet 4.6) + 20 msg/session localStorage rate-limit
- **OG image (1200×630)**, sitemap.xml, robots.txt
- **Vercel Analytics + Speed Insights**
- Email + password auth (matches portfolio standard, migrated from magic-link 2026-05-15)

## Not in V1

- Comments / replies on posts
- Newsletter / email subscription
- RSS feed
- Paid tier / membership / Stripe
- Multi-author or guest posts
- Custom domain (chasewhittaker.com is optional, deferred)
- Mobile app / iOS reader
- Cross-posting to Substack or LinkedIn
- Tags, categories, or post search

## Success metrics

- ≥1 post published per week for 4 consecutive weeks (matches behavioral-lane floor, breaks the never-published streak).
- *Revisit after first 4 weeks:* outcome metrics (inbound hiring messages, troubleshooter usage by non-Chase visitors) are intentionally NOT measured in V1. The single failure mode for V1 is "never publishing" — fix that first, then layer outcome metrics in V2.
