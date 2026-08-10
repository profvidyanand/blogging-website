-- Site settings (social links) + article view counts

alter table public.articles
  add column if not exists view_count bigint not null default 0;

create index if not exists articles_view_count_idx on public.articles (view_count desc)
  where status = 'published';

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  facebook_url text not null default '',
  instagram_url text not null default '',
  twitter_url text not null default '',
  youtube_url text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

-- Public read for social links on the website
create policy "site_settings_select_public" on public.site_settings
  for select to anon, authenticated using (true);

-- Admins can update site settings
create policy "site_settings_update_authenticated" on public.site_settings
  for update to authenticated using (true) with check (true);

create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Allow anonymous users to increment view count on published articles only
create or replace function public.increment_article_view_count(article_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.articles
  set view_count = view_count + 1
  where slug = article_slug and status = 'published';
end;
$$;

grant execute on function public.increment_article_view_count(text) to anon, authenticated;
