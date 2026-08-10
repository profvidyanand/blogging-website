# AI Blog Platform

Next.js (App Router) SEO blog + admin panel for AI-assisted topic/article generation.
Deployed on Vercel. Backed by Supabase.

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
| `npm run start` | Run production build locally |

## Deploy (Vercel)

1. Connect the GitHub repo to [Vercel](https://vercel.com).
2. Set environment variables from [`.env.example`](.env.example) in the Vercel project settings.
3. Deploy (automatic on push to your production branch).
4. Smoke test: login → Get Topics → Generate Blog → Publish → open public URL; confirm Unsplash featured image loads.
5. Update Supabase Auth redirect URLs to include your Vercel domain.

## Admin flow

`/admin/login` → Categories → Get Topics → Generate Blog → Preview/Edit → Publish.
