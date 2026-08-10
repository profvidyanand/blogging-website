alter table public.site_settings
  add column if not exists extra_buttons jsonb not null default '[]'::jsonb;
