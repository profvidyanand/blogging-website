# Setup Guide — Keys, Accounts & Steps

Follow these steps in order. Each step lists **what to do**, **what keys to create**, and **where they go**.

Copy [`.env.example`](.env.example) to `.env.local` (or `.env`) and fill values as you go.

---

## Key map (quick reference)

| Env var | Where you get it | Safe in browser? | Used for |
|---------|------------------|------------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Yes | All DB/auth calls |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → API → publishable / anon key (`sb_publishable_…` or `eyJ…`) | Yes | Client + RLS-bound server |
| `SUPABASE_SECRET_KEY` | Supabase → API → secret / service_role (`sb_secret_…` or `eyJ…`) | **No** | Category create, dashboard stats |
| `AI_API_KEY` | OpenAI (or compatible provider) | **No** | Topic + article generation |
| `AI_API_BASE_URL` | Provider docs (default OpenAI) | **No** | AI endpoint |
| `AI_MODEL` | Provider model list | **No** | Model name |
| `UNSPLASH_ACCESS_KEY` | Unsplash Developers → App | **No** | Featured images |

Never commit `.env` or `.env.local`. Never put `SUPABASE_SECRET_KEY` or `AI_API_KEY` in `NEXT_PUBLIC_*` vars.

---

## Step 1 — Install the app locally

**Do:**

```bash
cd AI-Blogging-Tool
npm install
```

**Keys:** none yet.

**Done when:** `npm run build` works (no env required for compile).

---

## Step 2 — Create a Supabase project

**Do:**

1. Go to [https://supabase.com](https://supabase.com) → New project.
2. Note the region and save the database password.

**Keys to copy** (Project Settings → **API**):

| Key | Env var |
|-----|---------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| Publishable / anon key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Secret / service_role key | `SUPABASE_SECRET_KEY` |

> Supabase’s newer naming uses `sb_publishable_…` and `sb_secret_…`. Older projects show `anon` and `service_role` JWTs (`eyJ…`). Either pair works — use the **publishable/anon** for public and the **secret/service_role** for server-only.

**Put in:** `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

---

## Step 3 — Run the database migration

**Do:**

1. Supabase Dashboard → **SQL Editor** → New query.
2. Paste the full contents of [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql).
3. Run it.

**Keys:** none.

**Done when:** Tables exist: `admins`, `categories`, `category_assignments`, `topics`, `articles`, `activity_log`.

Optional check in SQL Editor:

```sql
select table_name from information_schema.tables
where table_schema = 'public'
order by 1;
```

---

## Step 4 — Create your first admin user

**Do:**

1. Supabase → **Authentication** → **Users** → **Add user**.
2. Create with email + password (this is your admin login).
3. Optionally set user metadata `full_name` (used as author name on articles).

The trigger `on_auth_user_created` inserts a row into `public.admins` automatically.

**Keys:** none (you create a **login**, not an API key).

**Verify:**

```sql
select id, email, full_name from public.admins;
```

You should see your user. Save the `id` UUID if you plan to seed categories manually later.

---

## Step 5 — Create an AI provider key

**Do (OpenAI example):**

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Create a secret key.
3. Ensure billing / credits are enabled so Chat Completions work.

**Keys:**

| Key | Env var | Example |
|-----|---------|---------|
| API key | `AI_API_KEY` | `sk-…` |
| Base URL | `AI_API_BASE_URL` | `https://api.openai.com/v1` |
| Model | `AI_MODEL` | `gpt-4o-mini` |

**Compatible alternatives:** Any OpenAI-compatible Chat Completions API (Groq, OpenRouter, Azure OpenAI, etc.) — change `AI_API_BASE_URL` + `AI_MODEL` only; keep `lib/ai.ts` as-is.

**Put in:** `.env.local`

```env
AI_API_KEY=sk-...
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
```

---

## Step 6 — Create an Unsplash Access Key

**Do:**

1. Go to [https://unsplash.com/developers](https://unsplash.com/developers).
2. New Application → accept terms.
3. Copy the **Access Key** (not the Secret Key for this app).

**Keys:**

| Key | Env var |
|-----|---------|
| Access Key | `UNSPLASH_ACCESS_KEY` |

**Put in:** `.env.local`

```env
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

If this is missing, article generation still works — featured image stays empty and you can paste a URL in Edit Article.

---

## Step 7 — Run locally and smoke-test

**Do:**

```bash
npm run dev
```

Open:

- Public: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

**Walkthrough:**

1. Sign in with the Supabase Auth user from Step 4.
2. **Categories** → New Category (auto-assigns to you + creates `slug`).
3. Open the category → **Get Topics** (uses `AI_API_KEY`).
4. **Generate Blog** (AI → Unsplash → draft article).
5. Preview → Edit if needed → **Publish**.
6. Open `/blog/{slug}` on the public site; confirm the Unsplash featured image loads.

**Done when:** published article is visible anonymously and drafts are not.

---

## Step 8 — Deploy to Vercel (production)

Local `.env.local` is **not** used in production. Set environment variables in Vercel.

### 8a — Connect the repo

1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository.
3. Framework preset: **Next.js** (auto-detected).

### 8b — Set environment variables

In Vercel → Project → **Settings** → **Environment Variables**, add every var from [`.env.example`](.env.example):

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Plain |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Plain |
| `SUPABASE_SECRET_KEY` | Secret |
| `AI_API_KEY` | Secret |
| `AI_API_BASE_URL` | Plain |
| `AI_MODEL` | Plain |
| `UNSPLASH_ACCESS_KEY` | Secret (optional) |

### 8c — Supabase Auth URLs

In Supabase → **Authentication** → **URL Configuration**:

- **Site URL:** your Vercel production URL (e.g. `https://your-app.vercel.app`)
- **Redirect URLs:** add `https://your-app.vercel.app/**` and `http://localhost:3000/**`

### 8d — Deploy

Push to your connected branch, or click **Deploy** in the Vercel dashboard. Vercel runs `npm run build` automatically.

### 8e — Production smoke test

Same flow as Step 7 on your Vercel URL.

---

## Checklist (print / tick)

- [ ] `npm install`
- [ ] Supabase project created
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set
- [ ] `SUPABASE_SECRET_KEY` set
- [ ] Ran `001_initial.sql`
- [ ] Admin Auth user created + row in `admins`
- [ ] `AI_API_KEY` + `AI_API_BASE_URL` + `AI_MODEL` set
- [ ] `UNSPLASH_ACCESS_KEY` set (optional but recommended)
- [ ] Local smoke: login → topics → generate → publish
- [ ] Vercel env vars set + GitHub connected
- [ ] Supabase Auth redirect URLs updated
- [ ] Production smoke test

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Using secret key in `NEXT_PUBLIC_*` | Only publishable/anon is public |
| Skipping migration | Auth/login may work but categories/articles fail |
| Creating admin only in `admins` table | Must create via **Auth → Users** so login works |
| Deploy without secrets | AI/category-create will fail at runtime |
| Forgetting AI billing | Topic/article generation returns 502 |

---

## File pointers

| Need | File |
|------|------|
| Env template | [`.env.example`](.env.example) |
| DB schema + RLS | [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql) |
| Seed examples | [`supabase/seed.sql`](supabase/seed.sql) |
| Short overview | [`README.md`](README.md) |
