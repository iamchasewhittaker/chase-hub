# chase-hub

A personal hub built to show payments depth, not just claim it. Live at [chase-hub.vercel.app](https://chase-hub.vercel.app).

The landing page leads with the merchant payments flow I've worked across (authorization, tokenization, 3DS, decline handling, settlement), doubles as an always-on portfolio, and has a phone-friendly composer so I can publish short posts without a laptop.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing page: who I am, the payments flow, recent writing |
| `/payments` | Walk-through of the merchant payments lifecycle |
| `/login` · `/admin` | Auth-gated composer for publishing posts from my phone |

## Stack

Next.js 16 (App Router), React, TypeScript, Tailwind 4, Framer Motion, Supabase (auth + posts), Vercel AI Gateway. Deployed on Vercel.

## Run locally

```bash
pnpm install
cp .env.example .env.local   # add Supabase keys
pnpm dev
```

Open http://localhost:3000.

## Status

Live and in regular use. Single-user by design (only I publish; everyone else reads).
