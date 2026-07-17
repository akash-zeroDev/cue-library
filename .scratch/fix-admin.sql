-- 1. Add the missing price column for premium prompts
alter table public.prompts add column if not exists price numeric not null default 0;

-- 2. Relax the security policy on the new contents table so your admin account can write to it
drop policy if exists "Auth write contents" on public.prompt_contents;

create policy "Auth write contents"
  on public.prompt_contents for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
