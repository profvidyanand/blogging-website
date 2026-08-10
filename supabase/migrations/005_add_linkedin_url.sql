alter table public.site_settings
  add column if not exists linkedin_url text not null default '';
