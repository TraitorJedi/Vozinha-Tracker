# Vozinha Tracker

A Vercel-ready Next.js app that tracks `@vozinha1` against Tom Brady's `@tombrady` Instagram follower count, inspired by the live dashboard feel of musk.fyi.

## What it does

- Big live headline counts for Vozinha and Tom Brady
- Gap, progress-to-Brady percentage, and followers needed to pass Brady
- Auto-refreshes every 30 seconds
- Stores local browser snapshots so the page can show recent momentum
- Works on Vercel with real server-side Instagram follower data providers

## Important note about Instagram data

Instagram does not provide a simple free public follower-count API for arbitrary accounts, and direct scraping can be rate-limited or blocked. This repo now checks multiple real data sources before falling back to manual/demo values:

1. **Custom provider:** set `IG_FOLLOWER_API_URL` to your own endpoint/provider that returns both counts.
2. **Apify provider:** set `APIFY_TOKEN` to run an Instagram follower-count actor for `vozinha1` and `tombrady`; optionally override `APIFY_INSTAGRAM_ACTOR`.
3. **Instastatistics fallback:** enabled by default and fetches public live-count pages for `@vozinha1` and `@tombrady`; set `INSTASTATISTICS_ENABLED=false` to disable it.
4. **Manual fallback:** set `VOZINHA_FOLLOWERS` and `TOM_BRADY_FOLLOWERS` in Vercel env vars.
5. **Local demo:** if no source works, the app uses built-in sample values.

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

## Built-in provider order

The API route tries providers in this order on every refresh:

1. `IG_FOLLOWER_API_URL` with optional `IG_FOLLOWER_API_TOKEN` bearer auth.
2. Apify, when `APIFY_TOKEN` is present.
3. Instastatistics public pages, unless `INSTASTATISTICS_ENABLED=false`.
4. Environment/manual values.
5. Built-in demo values.

The JSON response includes `source` so the UI shows whether the current counts came from `custom-provider`, `apify`, `instastatistics`, `env`, or `demo`.

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
