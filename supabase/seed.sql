-- Seed data for local / staging verification.
-- Prerequisite: create two auth.users in Supabase Auth Dashboard (or via Admin API),
-- then replace the UUIDs below with the real auth.users ids.
-- The on_auth_user_created trigger will have already inserted into public.admins.

-- Example UUIDs (replace before running):
-- Admin A: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
-- Admin B: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb

-- Categories (inserted with security definer / service role — bypasses RLS)
-- Run this with the service role / SQL editor as postgres:

/*
insert into public.categories (id, name, slug, description, status, created_by)
values
  ('11111111-1111-1111-1111-111111111111', 'Technology', 'technology', 'Tech news and guides', 'active', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-2222-2222-2222-222222222222', 'Health', 'health', 'Health and wellness', 'active', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

insert into public.category_assignments (category_id, admin_id)
values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

-- RLS verification checklist (run as each role):
-- 1. As Admin A JWT: SELECT * FROM categories WHERE id = '22222222-...' → 0 rows
-- 2. As anon: SELECT * FROM articles WHERE status != 'published' → 0 rows (policy filters)
-- 3. As authenticated Admin A: INSERT INTO categories (name, slug) VALUES ('x','x') → denied
-- 4. As authenticated Admin A: INSERT INTO category_assignments (...) → denied
*/

-- Placeholder so the file is non-empty and documented.
select 1;
