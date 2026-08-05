alter table public.categories
  add column if not exists language text not null default 'english';

alter table public.categories
  drop constraint if exists categories_language_check;

alter table public.categories
  add constraint categories_language_check
  check (language in ('english', 'hindi', 'sanskrit', 'marathi', 'gujarati'));

update public.categories
set language = 'english'
where language is null;
