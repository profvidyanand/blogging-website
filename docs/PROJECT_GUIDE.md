# AI Blog Platform — Project Guide

A plain-language map of this project: what it is, how pieces connect, where files live, and how to make small changes safely.

You do **not** need to be a developer to use this guide. When you change text or settings in a file, save the file, refresh the site (or restart `npm run dev` if needed), and check the result in the browser.

---

## 1. What this project is

This is a **blog website** plus a private **admin panel**.

| Side | Who uses it | What they do |
|------|-------------|--------------|
| **Public site** | Visitors | Read articles, browse categories, search, listen to articles |
| **Admin panel** (`/admin`) | Editors / admins | Create categories, generate topic ideas with AI, generate articles, edit, publish |

**Brand in the code today:** Vishvanath Solutions (Prof. Dr. Vidyaprasad Shukla / Swami Vidyanand Paramahans). Most of that text lives in one file: `lib/site-config.ts`.

**Typical story:**

1. Admin logs in.
2. Creates a **category** (e.g. “Spirituality”) and optionally picks a language (English / Hindi).
3. Clicks **Get Topics** → AI suggests article ideas.
4. Clicks **Generate Blog** on a topic → AI writes a draft + finds a cover image.
5. Admin **edits** if needed, then **publishes**.
6. The article appears on the public site at `/blog/some-article-name`.

---

## 2. Tech stack (what powers the site)

Think of these as the “tools in the toolbox,” not things you edit every day.

| Area | Technology | Simple meaning |
|------|------------|----------------|
| Website framework | **Next.js 16** + **React 19** + **TypeScript** | Builds pages and the admin UI |
| Styling | **Tailwind CSS v4** + **shadcn** UI pieces | Colors, spacing, buttons, forms |
| Database & login | **Supabase** (Postgres + Auth) | Stores articles, categories, users; handles passwords |
| AI writing | **OpenAI-compatible API** (default model `gpt-4o-mini`) | Generates topics and full articles |
| Cover images | **Unsplash API** | Finds featured photos for articles |
| Math on screen | **KaTeX** | Shows formulas nicely in articles |
| Math for listening | Custom **math-to-speech** code | Turns formulas into spoken words |
| Hosting | **Vercel** (typical) | Puts the site on the internet |
| Validation | **Zod** | Checks AI/API data shapes before saving |

Detailed setup (keys, accounts, first run): see [`SETUP.md`](./SETUP.md).  
Short overview: see [`README.md`](../README.md).

---

## 3. Big picture flow

```
┌─────────────────────────────────────────────────────────────┐
│  ADMIN (logged in)                                          │
│  Login → Categories → Topics (AI) → Generate article (AI)   │
│       → Edit draft → Publish                                │
└───────────────────────────┬─────────────────────────────────┘
                            │ saves to
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE (Supabase)                                        │
│  categories · topics · articles · admins · site settings    │
└───────────────────────────┬─────────────────────────────────┘
                            │ reads published content
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  PUBLIC SITE                                                │
│  Home · Category pages · Blog post · About · Contact        │
│  Search · Listen (speech + math engine) · View counts       │
└─────────────────────────────────────────────────────────────┘
```

### Admin content pipeline (step by step)

| Step | Where in the UI | What happens behind the scenes |
|------|-----------------|--------------------------------|
| 1. Login | `/admin/login` | Supabase checks email/password |
| 2. Create category | Admin → Categories | Row in `categories`; you are assigned to it |
| 3. Get Topics | Category detail page | Calls AI → rows in `topics` (status: pending) |
| 4. Generate Blog | Topic row button | AI writes article → Unsplash image → draft in `articles` |
| 5. Preview / Edit | Admin → Articles | You change title, body, SEO, FAQ, image |
| 6. Publish | Preview page | Status becomes `published` → visible on public site |
| 7. Visitor reads | `/blog/[slug]` | Page loads; view count increases; optional “listen” |

---

## 4. Folder map (where things live)

Open the project folder. These are the important rooms:

| Folder / file | Purpose |
|---------------|---------|
| `app/` | **Pages and URLs.** If you change a route or a page’s main content, start here. |
| `app/(public)/` | Public website pages (home, blog, about, …). The `(public)` name is only for organization — it does **not** appear in the URL. |
| `app/admin/` | Admin login and admin panel pages. |
| `app/api/` | Server “endpoints” the UI calls (create category, generate article, publish, …). |
| `components/public/` | Reusable public UI pieces (header, footer, blog card, audio player). |
| `components/admin/` | Reusable admin UI pieces (sidebar, forms, tables, generate button). |
| `components/ui/` | Shared buttons, inputs, dialogs (design system). |
| `lib/` | Business logic: AI, auth, database clients, site name, math/TTS. |
| `hooks/` | Browser helpers for speech (play / pause / voices). |
| `supabase/migrations/` | Database structure (tables) as SQL files. |
| `public/` | Static files (images, icons). Example: `public/images/prof-vidyanand.png`. |
| `docs/` | Guides like this one and SETUP. |
| `middleware.ts` | Gatekeeper: blocks `/admin/*` unless you are logged in. |
| `.env` / `.env.local` | Secrets and API keys (never share or commit these). |
| `.env.example` | Template of required keys (safe to share). |

---

## 5. Public website

Layout (header + footer) wraps all public pages: `app/(public)/layout.tsx`.

| URL | File | What visitors see |
|-----|------|-------------------|
| `/` | `app/(public)/page.tsx` | Home: categories, highlights, latest posts. Search via `?q=...` |
| `/category/[slug]` | `app/(public)/category/[slug]/page.tsx` | Articles in one category |
| `/blog/[slug]` | `app/(public)/blog/[slug]/page.tsx` | Full article, FAQ, related posts, listen player |
| `/about` | `app/(public)/about/page.tsx` | About the author / brand |
| `/contact` | `app/(public)/contact/page.tsx` | Contact email / location |
| `/privacy` | `app/(public)/privacy/page.tsx` | Privacy policy |
| `/sitemap` | `app/(public)/sitemap/page.tsx` | Human-readable list of pages |
| `/sitemap.xml` | `app/sitemap.ts` | For Google / search engines |
| `/robots.txt` | `app/robots.ts` | Tells bots: allow site, block `/admin` and `/api` |

### Public components (`components/public/`)

| File | Job |
|------|-----|
| `public-header.tsx` | Top navigation |
| `public-footer.tsx` | Footer links and copyright |
| `search-bar.tsx` | Search box |
| `blog-card.tsx` | Article preview card (title, summary, image) |
| `category-tile.tsx` / `category-nav.tsx` / `category-highlight-card.tsx` | Category browsing |
| `blog-article-content.tsx` | Renders the article HTML (including math) |
| `blog-article-faq.tsx` | FAQ section under the article |
| `reading-progress.tsx` | Progress bar while scrolling |
| `audio-player.tsx` | Listen-to-article controls |
| `voice-selector.tsx` / `speed-selector.tsx` | Voice and speed for listening |
| `article-view-tracker.tsx` | Counts a page view |
| `social-links-row.tsx` | Facebook / Instagram / X / YouTube links |

---

## 6. Admin panel

**Login required** for everything under `/admin` except `/admin/login`.

| URL | File | What admins do |
|-----|------|----------------|
| `/admin/login` | `app/admin/login/` | Sign in with email + password |
| `/admin` | `app/admin/(panel)/page.tsx` | Dashboard: counts and recent activity |
| `/admin/categories` | `.../categories/` | List / create / manage categories |
| `/admin/categories/[categoryId]` | `.../categories/[categoryId]/` | Get Topics, add topic, Generate Blog |
| `/admin/articles` | `.../articles/` | Filter and list all articles |
| `/admin/articles/[articleId]` | `.../articles/[articleId]/` | Preview + publish / unpublish |
| `/admin/articles/[articleId]/edit` | `.../edit/` | Edit title, SEO, body, FAQ, tags, image |
| `/admin/settings` | `.../settings/` | Social media URLs shown on the public site |

### Admin components (`components/admin/`)

| File | Job |
|------|-----|
| `admin-sidebar.tsx` | Left menu (Dashboard, Categories, Articles, Settings) |
| `admin-topbar.tsx` | Top bar in the panel |
| `category-form.tsx` | Create / edit a category |
| `get-topics-form.tsx` | “How many topics?” + Get Topics |
| `add-topic-form.tsx` | Add one topic by hand |
| `topic-table.tsx` | List of topics + Generate Blog |
| `generate-article-button.tsx` | Starts AI article generation |
| `article-editor.tsx` | Edit article fields |
| `social-links-form.tsx` | Site social URLs |
| `stat-card.tsx` / `data-table.tsx` / `page-header.tsx` | Dashboard and lists |
| `confirm-dialog.tsx` | “Are you sure?” before delete |
| `language-badge.tsx` / `status-badge.tsx` | Small labels |
| `force-dark-mode.tsx` | Keeps admin UI in dark mode |

### Important API routes (admin actions)

These are called by buttons/forms. You rarely edit them unless fixing a bug.

| Method + path | Purpose |
|---------------|---------|
| `POST /api/admin/categories` | Create category |
| `PATCH/DELETE /api/admin/categories/[id]` | Update / delete category |
| `GET/POST /api/admin/categories/[id]/topics` | List topics / AI generate topics / add one |
| `PATCH/DELETE /api/admin/topics/[id]` | Edit / delete topic |
| `POST /api/admin/topics/[id]/generate-article` | AI article + image → draft |
| `PATCH/DELETE /api/admin/articles/[id]` | Update / delete article |
| `POST .../publish` / `.../unpublish` | Publish or unpublish |
| `GET/PUT /api/admin/site-settings` | Social links |
| `GET/POST /api/admin/languages` | Languages for generation |
| `GET /api/admin/dashboard/stats` | Dashboard numbers |
| `POST /api/articles/[slug]/view` | Public view counter |

---

## 7. Database (Supabase)

Data is stored in tables. Migrations live in `supabase/migrations/` (run in order: `001` → `002` → `003` → `004`).

### How tables relate

```
auth.users (Supabase login accounts)
    └── admins (one row per admin)

admins ── category_assignments ── categories ── languages
                                    │
                                    ├── topics
                                    └── articles

activity_log   (who did what)
site_settings  (one row: social links)
```

### Tables in plain English

| Table | What it stores |
|-------|----------------|
| `admins` | Who can use the admin panel (linked to login user) |
| `categories` | Topic areas (name, slug, description, language, active/inactive) |
| `category_assignments` | Which admin can manage which category |
| `topics` | Article ideas waiting to be written (`pending` or `generated`) |
| `articles` | Full posts: title, slug, SEO, HTML body, FAQ, tags, image, status, views |
| `activity_log` | Audit trail (e.g. topic generated, article published) |
| `site_settings` | Facebook / Instagram / Twitter / YouTube URLs |
| `languages` | Codes like `en`, `hi` used when generating content |

### Article statuses

- `draft` — generated or edited; not public  
- `published` — visible on the public site  
- `unpublished` — taken down  
- `scheduled` — reserved for future scheduling  

### Security note (why admins only see “their” categories)

**Row Level Security (RLS)** in Supabase means: visitors only see **published** articles; admins only manage categories they are **assigned** to. Creating a category uses a special server key (`SUPABASE_SECRET_KEY`) and auto-assigns it to you.

---

## 8. Math engine & listen-to-article

There is **no ranking / scoring engine**. “Math engine” here means: **show formulas on screen** and **speak them aloud** correctly.

| Piece | File | What it does |
|-------|------|--------------|
| Show math | `lib/render-blog-content.ts` | Turns `$x^2$` / `$$...$$` into nice HTML via KaTeX |
| Speak math | `lib/tts/math-to-speech.ts` | Turns formulas into phrases like “x squared”, “a over b” |
| Prepare text to speak | `lib/tts/content-extractor.ts` | Walks the article and builds speakable chunks |
| Sentence splits | `lib/tts/sentence-segmenter.ts` | Breaks text into playable sentences |
| Play / pause | `hooks/use-speech-queue.ts` | Browser speech queue |
| Voices | `hooks/use-speech-voices.ts` | Available system voices |
| Player UI | `components/public/audio-player.tsx` | Listen controls on the blog page |

**Minor change example:** To change how a Greek letter or operator is spoken, edit the word lists near the top of `lib/tts/math-to-speech.ts` (e.g. `"\\alpha": "alpha"`).

Test helpers (for developers): `scripts/test-math-speech.mjs`, `scripts/test-math-to-speech.ts`.

---

## 9. AI blogging engine

Core file: `lib/ai.ts`.

| Function | Used for |
|----------|----------|
| `generateTopics()` | “Get Topics” — many ideas for a category + language |
| `generateArticle()` | “Generate Blog” — full draft (title, SEO, HTML, FAQ, tags, image search phrases) |

Images: `lib/unsplash.ts` searches Unsplash using those phrases and saves a featured image URL + credit.

**What you can safely tweak (with care):**

- Category **description** in the admin UI — this acts as an editorial brief for the AI.
- Category **language** — English vs Hindi (and any languages added via admin/API).
- Env vars `AI_MODEL`, `AI_MAX_TOKENS`, `AI_API_BASE_URL` — which model and provider to use (see SETUP.md).

Avoid casually rewriting long prompt strings in `lib/ai.ts` unless you know what you want the AI to change; small wording changes can change article quality a lot.

---

## 10. Brand, identity & site settings

### Hard-coded brand (code file)

File: **`lib/site-config.ts`**

Change these when you need to update:

- Site name  
- Domain / URL  
- Tagline and description  
- Contact email  
- Author full name / sannyas name  
- Portrait path (`/images/...` under `public/`)

Example fields already in the file:

```ts
name: "Vishvanath Solutions"
email: "profmastervidyanand@gmail.com"
client.fullName: "Prof. Dr. Vidyaprasad Shukla"
client.portrait: "/images/prof-vidyanand.png"
```

### Social links (admin UI + database)

Edit in **Admin → Site settings**, or via `site_settings` in the database.  
Form component: `components/admin/social-links-form.tsx`.  
Logic: `lib/site-settings.ts`.

### Author portrait

Replace the image file at `public/images/prof-vidyanand.png` (keep the same filename, or update the path in `lib/site-config.ts`).

---

## 11. Environment variables (secrets)

Copy from `.env.example`. Full walkthrough: [`SETUP.md`](./SETUP.md).

| Variable | Meaning |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project address |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public key (safe for browser) |
| `SUPABASE_SECRET_KEY` | Powerful server key — **never** expose in the browser |
| `AI_API_KEY` | Key for the AI provider |
| `AI_API_BASE_URL` | AI API base URL (OpenAI, Groq, etc.) |
| `AI_MODEL` | Model name (e.g. `gpt-4o-mini`) |
| `AI_MAX_TOKENS` | Max length of AI replies |
| `UNSPLASH_ACCESS_KEY` | Cover images (optional but recommended) |

Never commit `.env` or paste secret keys into chat / GitHub.

---

## 12. How to make minor changes (cheat sheet)

Use this table when you want a small update and need the right file.

| I want to… | Open this |
|------------|-----------|
| Change site name, tagline, email, author name | `lib/site-config.ts` |
| Change author photo | `public/images/prof-vidyanand.png` (+ path in site-config if renamed) |
| Change About page text | `app/(public)/about/page.tsx` |
| Change Contact page | `app/(public)/contact/page.tsx` |
| Change Privacy policy | `app/(public)/privacy/page.tsx` |
| Change header links / nav | `components/public/public-header.tsx` |
| Change footer | `components/public/public-footer.tsx` |
| Change home page sections | `app/(public)/page.tsx` |
| Change social links | Admin → Settings (preferred) |
| Change how math is spoken | `lib/tts/math-to-speech.ts` |
| Change article look (fonts/spacing in body) | `app/blog-content.css` and/or `app/globals.css` |
| Change global colors / theme tokens | `app/globals.css` |
| Add / change an admin menu item | `components/admin/admin-sidebar.tsx` |
| Tweak AI model or provider | `.env` (`AI_*` variables) |
| Understand setup from zero | `docs/SETUP.md` |

### Safe habits for non-tech editors

1. **Change one thing at a time**, then check the browser.  
2. Prefer **Admin UI** for content (articles, categories, social links) over editing database SQL.  
3. Prefer **`lib/site-config.ts`** for brand text over hunting through many pages.  
4. Do **not** delete brackets `{ }`, quotes `" "`, or commas in code files — syntax must stay valid.  
5. If the site breaks after an edit, use **Undo** in the editor, or ask a developer to check the terminal error.  
6. Never put passwords or API keys into markdown docs or commits.

### Run the site locally (reminder)

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:3000`).  
Admin: `http://localhost:3000/admin/login`.

---

## 13. Shared UI & styling

- Design tokens (colors, radius, shadows): `app/globals.css`  
- Fonts: configured in `app/layout.tsx` (Geist + Source Serif 4)  
- Reusable controls: `components/ui/` (button, input, dialog, table, …)  
- Loading placeholders: `components/loading/`  
- Admin often forced to dark mode via `force-dark-mode.tsx`

You usually do **not** need to edit `components/ui/` for content changes.

---

## 14. Auth (login) in simple terms

1. Create a user in **Supabase → Authentication → Users**.  
2. A database trigger also creates a row in `admins`.  
3. Login form: `app/admin/login/` → Supabase `signInWithPassword`.  
4. `middleware.ts` keeps strangers out of `/admin`.  
5. Logout is available from the admin sidebar.

Public visitors do **not** need an account.

---

## 15. Other useful `lib/` files

| File | Role |
|------|------|
| `lib/auth.ts` | Ensures the current user is an admin |
| `lib/api.ts` | Protects admin API routes |
| `lib/supabase/client.ts` | Browser database client |
| `lib/supabase/server.ts` | Server database client (cookies) |
| `lib/supabase/admin.ts` | Service-role client (powerful; server only) |
| `lib/slug.ts` | Turns titles into URL slugs |
| `lib/types.ts` | TypeScript shapes for Category, Article, Topic, … |
| `lib/languages.ts` | Language helpers |
| `lib/activity.ts` | Writes activity log entries |
| `lib/category-colors.ts` | Consistent color accents per category |
| `lib/format-view-count.ts` | Formats “1.2K views” style numbers |
| `lib/utils.ts` | Small helper to merge CSS class names |

---

## 16. Seed data

File: `supabase/seed.sql`

- Mostly **commented examples** (not live production data).  
- Shows how to insert sample categories after you have real admin user IDs.  
- Languages English + Hindi are seeded by migration `004_languages_table.sql`.

---

## 17. Deploy (high level)

1. Push code to GitHub.  
2. Connect the repo to **Vercel**.  
3. Copy all keys from `.env.example` into Vercel Environment Variables.  
4. Deploy.  
5. In Supabase Auth, allow your Vercel domain in redirect URLs.  
6. Smoke test: login → Get Topics → Generate Blog → Publish → open the public article URL.

Details: [`README.md`](../README.md) and [`SETUP.md`](./SETUP.md).

---

## 18. Glossary

| Term | Meaning |
|------|---------|
| **Slug** | URL-friendly name, e.g. `my-first-article` in `/blog/my-first-article` |
| **Draft** | Article saved but not public |
| **Publish** | Make the article visible to everyone |
| **Category** | Folder-like topic area for articles |
| **Topic** | An idea waiting to become an article |
| **RLS** | Database rules that control who can read/write rows |
| **API route** | A server URL the app calls to save or generate data |
| **Env / `.env`** | Private configuration (keys, URLs) |
| **Migration** | SQL file that creates or updates database structure |
| **TTS** | Text-to-speech (listen to article) |
| **KaTeX** | Library that displays math formulas |

---

## 19. Quick mental model

> **Public pages** show published content.  
> **Admin pages** create and publish that content.  
> **AI** helps invent topics and write drafts.  
> **Supabase** stores everything and handles login.  
> **Math/TTS libs** make formulas look and sound right.  
> **`lib/site-config.ts`** is the first place to change brand identity.

If you only remember one file for branding edits, remember: **`lib/site-config.ts`**.  
If you only remember one flow for content: **Categories → Get Topics → Generate Blog → Edit → Publish**.
