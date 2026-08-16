---
title: I'm not an engineer. Here's what I can actually ship now, and what still breaks.
date: 2026-08-12
source: operator lesson (building with AI, 2026)
status:
  drafted: true
  linkedin: false
  threads: false
  chase_hub_feed: false
---

I don't have a CS degree. What I have is 7 years of knowing how payment flows break. This year I started shipping real software with AI tools, and I want to say plainly what that means, not the vague version.

What I can ship now: a Next.js app with real auth, a Postgres database with row-level security so each user only sees their own data, a dashboard reading live financial data instead of a demo. I built a lawn-care app that pulls live weather data and tracks soil temperature against a fertilizer schedule. I built a money app that reads real account data and computes an honest "are we okay this month" answer. None of that was possible for me a year ago without hiring an engineer.

What still breaks: I can't eyeball whether a database migration is safe at 2am. I lean hard on tests passing before I trust a change. I still don't fully understand what I don't understand, which is the actual risk, not the code itself.

The honest version of "AI lets non-engineers build" isn't that the engineering disappears. It's that the operator instinct, knowing what should break and where to look first, now has a way to become real software instead of a feature request someone else has to prioritize.

If you've made this jump too, what surprised you most: what got easier, or what you didn't expect to still be hard?

#buildinpublic #AI #payments
