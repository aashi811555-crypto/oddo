
-- 1. Create the gallery table if it does not exist.
create table if not exists public.wedding_photos (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Royal Events',
  category text not null default 'Wedding',
  image_url text not null,
  storage_path text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Add required columns to an existing table, if missing.
alter table public.wedding_photos
  add column if not exists title text not null default 'Royal Events';

alter table public.wedding_photos
  add column if not exists category text not null default 'Wedding';

alter table public.wedding_photos
  add column if not exists image_url text;

alter table public.wedding_photos
  add column if not exists storage_path text;

alter table public.wedding_photos
  add column if not exists published boolean not null default false;

alter table public.wedding_photos
  add column if not exists created_at timestamptz not null default now();

-- 3. Enable Row Level Security.
alter table public.wedding_photos enable row level security;

-- 4. Public visitors can see published photos only.
drop policy if exists "Public can view published photos"
  on public.wedding_photos;

create policy "Public can view published photos"
on public.wedding_photos
for select
to anon, authenticated
using (published = true);

-- 5. Admins can read all gallery records.
drop policy if exists "Admins can read all photos"
  on public.wedding_photos;

create policy "Admins can read all photos"
on public.wedding_photos
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 6. Admins can insert gallery records.
drop policy if exists "Admins can insert photos"
  on public.wedding_photos;

create policy "Admins can insert photos"
on public.wedding_photos
for insert
to authenticated
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 7. Admins can update gallery records.
drop policy if exists "Admins can update photos"
  on public.wedding_photos;

create policy "Admins can update photos"
on public.wedding_photos
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 8. Admins can delete gallery records.
drop policy if exists "Admins can delete photos"
  on public.wedding_photos;

create policy "Admins can delete photos"
on public.wedding_photos
for delete
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 9. Helpful index for the public gallery.
create index if not exists wedding_photos_published_created_idx
on public.wedding_photos (published, created_at desc);
