-- WatchMemo schema (fresh setup)
-- Run this on a new Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.watched_movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  imdb_id text not null,
  user_rating integer not null check (user_rating between 1 and 10),
  comment text,
  movie_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, imdb_id)
);

create index if not exists watched_movies_user_id_idx on public.watched_movies(user_id);
create index if not exists watched_movies_updated_at_idx on public.watched_movies(updated_at desc);

create or replace function public.set_watched_movies_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_watched_movies_updated_at on public.watched_movies;
create trigger trg_watched_movies_updated_at
before update on public.watched_movies
for each row
execute function public.set_watched_movies_updated_at();

alter table public.watched_movies enable row level security;

drop policy if exists "watched_movies_select_own" on public.watched_movies;
create policy "watched_movies_select_own"
on public.watched_movies
for select
using (auth.uid() = user_id);

drop policy if exists "watched_movies_insert_own" on public.watched_movies;
create policy "watched_movies_insert_own"
on public.watched_movies
for insert
with check (auth.uid() = user_id);

drop policy if exists "watched_movies_update_own" on public.watched_movies;
create policy "watched_movies_update_own"
on public.watched_movies
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "watched_movies_delete_own" on public.watched_movies;
create policy "watched_movies_delete_own"
on public.watched_movies
for delete
using (auth.uid() = user_id);
