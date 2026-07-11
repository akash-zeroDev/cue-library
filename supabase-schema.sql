-- ============================================================
-- CUE — Supabase schema
-- Run this once in your Supabase project (SQL editor).
-- ============================================================

-- 1. Prompts table
create table if not exists public.prompts (
  id          text        primary key,
  title       text        not null,
  category    text        not null,
  section     text        not null,
  tier        text        not null default 'free' check (tier in ('free','premium')),
  rail        text        check (rail in ('featured','fresh','trending')),
  brand       text        not null,
  variant     text        not null default 'sans' check (variant in ('sans','caps','serif','sans-accent')),
  stack       jsonb       not null default '[]'::jsonb,
  thumb_src   text,
  hover_src   text,
  prompt      text        not null,
  created_at  timestamptz not null default now()
);

-- 2. Row-Level Security
alter table public.prompts enable row level security;

drop policy if exists "Public read" on public.prompts;
drop policy if exists "Auth insert" on public.prompts;
drop policy if exists "Auth update" on public.prompts;
drop policy if exists "Auth delete" on public.prompts;

create policy "Public read"
  on public.prompts for select
  using (true);

create policy "Auth insert"
  on public.prompts for insert
  with check (auth.role() = 'authenticated');

create policy "Auth update"
  on public.prompts for update
  using (auth.role() = 'authenticated');

create policy "Auth delete"
  on public.prompts for delete
  using (auth.role() = 'authenticated');

-- 3. Storage bucket for images + video previews
insert into storage.buckets (id, name, public)
values ('cue-media', 'cue-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read media"   on storage.objects;
drop policy if exists "Auth upload media"   on storage.objects;
drop policy if exists "Auth delete media"   on storage.objects;

create policy "Public read media"
  on storage.objects for select
  using (bucket_id = 'cue-media');

create policy "Auth upload media"
  on storage.objects for insert
  with check (bucket_id = 'cue-media' and auth.role() = 'authenticated');

create policy "Auth delete media"
  on storage.objects for delete
  using (bucket_id = 'cue-media' and auth.role() = 'authenticated');

-- 4. (Optional) Admin user
-- In Supabase dashboard → Auth → Users → Add user.
-- That email + password becomes your admin login on /#/admin.
