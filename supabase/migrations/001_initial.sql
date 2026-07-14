-- 001_initial.sql
-- AI Blog Generator Platform — full schema + RLS
-- Order: extensions → helpers → tables → RLS helpers → indexes → RLS → triggers

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers (functions that do not reference tables yet)
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.category_assignments (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  admin_id uuid not null references public.admins(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (category_id, admin_id)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  topic text not null,
  status text not null default 'pending' check (status in ('pending','generated')),
  created_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete set null,
  category_id uuid not null references public.categories(id) on delete cascade,
  title text not null,
  slug text not null,
  seo_title text,
  meta_description text,
  summary text,
  content text not null default '',
  faq jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  featured_image text,
  featured_image_credit text,
  author_name text,
  status text not null default 'draft'
    check (status in ('draft','scheduled','published','unpublished')),
  scheduled_at timestamptz,
  published_at timestamptz,
  created_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admins(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS helper — must be created after category_assignments exists
create or replace function public.is_assigned_to_category(target_category_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.category_assignments ca
    where ca.category_id = target_category_id
      and ca.admin_id = auth.uid()
  );
$$;

grant execute on function public.is_assigned_to_category(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index categories_status_idx on public.categories (status);
create unique index categories_slug_idx on public.categories (slug);

create index category_assignments_admin_idx on public.category_assignments (admin_id);
create index category_assignments_category_idx on public.category_assignments (category_id);

create index topics_category_idx on public.topics (category_id);
create index topics_status_idx on public.topics (status);

create unique index articles_slug_idx on public.articles (slug);
create index articles_category_idx on public.articles (category_id);
create index articles_status_idx on public.articles (status);
create index articles_scheduled_due_idx on public.articles (scheduled_at) where status = 'scheduled';
create index articles_published_at_idx on public.articles (published_at desc) where status = 'published';

create index activity_log_admin_idx on public.activity_log (admin_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.category_assignments enable row level security;
alter table public.topics enable row level security;
alter table public.articles enable row level security;
alter table public.activity_log enable row level security;

-- admins
create policy "admins_select_own" on public.admins
  for select to authenticated
  using (id = auth.uid());
-- No insert/update/delete policy -> denied by default for authenticated & anon.

-- categories
create policy "categories_select_assigned" on public.categories
  for select to authenticated using (public.is_assigned_to_category(id));

create policy "categories_update_assigned" on public.categories
  for update to authenticated
  using (public.is_assigned_to_category(id))
  with check (public.is_assigned_to_category(id));

create policy "categories_delete_assigned" on public.categories
  for delete to authenticated using (public.is_assigned_to_category(id));

-- Public can read all categories (names needed for article detail even if inactive;
-- app filters status='active' for chips / category index pages).
create policy "categories_select_public" on public.categories
  for select to anon using (true);

-- No INSERT policy: creation + assignment via sb_secret only.

-- category_assignments
create policy "category_assignments_select_own" on public.category_assignments
  for select to authenticated using (admin_id = auth.uid());
-- No insert/update/delete for authenticated/anon.

-- topics
create policy "topics_select_assigned" on public.topics
  for select to authenticated using (public.is_assigned_to_category(category_id));

create policy "topics_insert_assigned" on public.topics
  for insert to authenticated
  with check (public.is_assigned_to_category(category_id) and created_by = auth.uid());

create policy "topics_update_assigned" on public.topics
  for update to authenticated
  using (public.is_assigned_to_category(category_id))
  with check (public.is_assigned_to_category(category_id));

create policy "topics_delete_assigned" on public.topics
  for delete to authenticated using (public.is_assigned_to_category(category_id));

-- articles
create policy "articles_select_assigned" on public.articles
  for select to authenticated using (public.is_assigned_to_category(category_id));

create policy "articles_select_public" on public.articles
  for select to anon using (status = 'published');

create policy "articles_insert_assigned" on public.articles
  for insert to authenticated
  with check (public.is_assigned_to_category(category_id) and created_by = auth.uid());

create policy "articles_update_assigned" on public.articles
  for update to authenticated
  using (public.is_assigned_to_category(category_id))
  with check (public.is_assigned_to_category(category_id));

create policy "articles_delete_assigned" on public.articles
  for delete to authenticated using (public.is_assigned_to_category(category_id));

-- activity_log
create policy "activity_log_select_own" on public.activity_log
  for select to authenticated using (admin_id = auth.uid());

create policy "activity_log_insert_own" on public.activity_log
  for insert to authenticated with check (admin_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_admin_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.admins (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_admin_user();

create trigger categories_set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

create trigger topics_set_updated_at before update on public.topics
  for each row execute function public.set_updated_at();

create trigger articles_set_updated_at before update on public.articles
  for each row execute function public.set_updated_at();
