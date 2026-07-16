-- Fix the Auth write contents policy so it ONLY applies to true Supabase admins
drop policy if exists "Auth write contents" on public.prompt_contents;

create policy "Auth write contents"
  on public.prompt_contents for all
  using (auth.role() = 'authenticated' and auth.jwt() ->> 'iss' = 'supabase')
  with check (auth.role() = 'authenticated' and auth.jwt() ->> 'iss' = 'supabase');
