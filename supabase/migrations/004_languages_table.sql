-- Dynamic languages for article generation (admin-managed)

create table if not exists public.languages (
  code text primary key,
  label text not null,
  created_at timestamptz not null default now()
);

insert into public.languages (code, label)
values
  ('english', 'English'),
  ('hindi', 'Hindi')
on conflict (code) do nothing;

alter table public.categories
  drop constraint if exists categories_language_check;

alter table public.categories
  drop constraint if exists categories_language_fkey;

alter table public.categories
  add constraint categories_language_fkey
  foreign key (language) references public.languages (code)
  on update cascade
  on delete restrict;

alter table public.languages enable row level security;

create policy "languages_select_public" on public.languages
  for select to anon, authenticated using (true);

create policy "languages_insert_authenticated" on public.languages
  for insert to authenticated with check (true);

create policy "languages_delete_authenticated" on public.languages
  for delete to authenticated using (true);
