-- Drop the strict role-based policies
drop policy if exists "Auth insert" on public.prompts;
drop policy if exists "Auth update" on public.prompts;
drop policy if exists "Auth delete" on public.prompts;

-- Create flexible policies that just check if a Clerk user ID exists in the JWT
create policy "Auth insert"
  on public.prompts for insert
  with check ( (auth.jwt() ->> 'sub') is not null );

create policy "Auth update"
  on public.prompts for update
  using ( (auth.jwt() ->> 'sub') is not null );

create policy "Auth delete"
  on public.prompts for delete
  using ( (auth.jwt() ->> 'sub') is not null );
