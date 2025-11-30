-- Create genres table
create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.genres enable row level security;

-- Read policy: allow anonymous and authenticated to read genres
do $$
begin
  if exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'genres' and policyname = 'genres_read_all'
  ) then
    drop policy genres_read_all on public.genres;
  end if;
end$$;
create policy genres_read_all on public.genres
  for select
  using (true);

-- Insert policy: only users with role 'master'
do $$
begin
  if exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'genres' and policyname = 'genres_insert_master'
  ) then
    drop policy genres_insert_master on public.genres;
  end if;
end$$;
create policy genres_insert_master on public.genres
  for insert
  to authenticated
  with check (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'master'
  ));

-- Delete policy: only users with role 'master'
do $$
begin
  if exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'genres' and policyname = 'genres_delete_master'
  ) then
    drop policy genres_delete_master on public.genres;
  end if;
end$$;
create policy genres_delete_master on public.genres
  for delete
  to authenticated
  using (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'master'
  ));

-- Update policy: only users with role 'master' (if needed)
do $$
begin
  if exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'genres' and policyname = 'genres_update_master'
  ) then
    drop policy genres_update_master on public.genres;
  end if;
end$$;
create policy genres_update_master on public.genres
  for update
  to authenticated
  using (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'master'
  ))
  with check (exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'master'
  ));

-- Helpful index
create index if not exists idx_genres_name on public.genres (name);
