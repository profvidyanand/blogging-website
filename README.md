# AI Blog Platform

Next.js (App Router) SEO blog + admin panel for AI-assisted topic/article generation.
Deployed to Cloudflare Workers via OpenNext. Backed by Supabase.

## Setup

**Full walkthrough (every key, every step):** [`docs/SETUP.md`](docs/SETUP.md)

Quick start:

1. Copy `.env.example` to `.env.local` and fill in values (see SETUP.md for where each key comes from).
2. Run the SQL in [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql) in the Supabase SQL Editor.
3. Create admin users in Supabase Auth (Authentication → Users). The trigger mirrors them into `public.admins`.
4. Seed categories using the commented examples in [`supabase/seed.sql`](supabase/seed.sql) (service role / SQL editor).
5. `npm install && npm run dev`

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local Next.js development |
| `npm run build` | Production Next.js build |
| `npm run deploy` | OpenNext build + Cloudflare Workers deploy |
| `npm run preview` | OpenNext build + local Workers preview |

## Deploy (Phase 13 checklist)

1. Put secrets (never commit):

```bash
npx wrangler secret put SUPABASE_SECRET_KEY
npx wrangler secret put AI_API_KEY
npx wrangler secret put UNSPLASH_ACCESS_KEY
npx wrangler secret put CRON_SECRET
```

2. Set non-secret `vars` in `wrangler.jsonc` (`NEXT_PUBLIC_*`, `AI_API_BASE_URL`, `AI_MODEL`).
3. Deploy: `npm run deploy`
4. Smoke test: login → Get Topics → Generate Blog → Publish → open public URL; confirm Unsplash featured image loads.
5. Cron: `npx wrangler dev --test-scheduled` then hit the scheduled endpoint to verify auto-publish.

## Admin flow

`/admin/login` → Categories → Get Topics → Generate Blog → Preview/Edit → Publish or Schedule.
