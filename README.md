# Vozinha Tracker

A Vercel-ready Next.js app that tracks `@vozinha1` against Tom Brady's `@tombrady` Instagram follower count, inspired by the live dashboard feel of musk.fyi.

## What it does

- Big live headline counts for Vozinha and Tom Brady
- Gap, progress-to-Brady percentage, and followers needed to pass Brady
- Auto-refreshes every 30 seconds
- Stores local browser snapshots so the page can show recent momentum
- Works on Vercel with optional server-side follower data provider

## Important note about Instagram data

Instagram does not provide a simple free public follower-count API for arbitrary accounts, and direct scraping can be rate-limited or blocked. This repo is set up with a clean provider layer:

1. **Recommended:** set `IG_FOLLOWER_API_URL` to your own small endpoint/provider that returns follower counts.
2. **Fallback:** set `VOZINHA_FOLLOWERS` and `TOM_BRADY_FOLLOWERS` in Vercel env vars.
3. **Local demo:** `.env.example` includes sample values pulled from recent public reporting.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or import this repo/zip into Vercel.

## Custom follower API format

Your `IG_FOLLOWER_API_URL` can return either:

```json
{ "vozinha1": 9200000, "tombrady": 15400000 }
```

or:

```json
{
  "accounts": {
    "vozinha1": { "followers": 9200000 },
    "tombrady": { "followers": 15400000 }
  }
}
```

If your provider requires a token, set `IG_FOLLOWER_API_TOKEN`; the API route will send it as `Authorization: Bearer <token>`.

## Files to edit

- `src/app/page.tsx` — main dashboard UI
- `src/app/api/followers/route.ts` — follower data endpoint/provider logic
- `src/app/globals.css` — visual styling
