-- Drop existing potentially leaky policies
drop policy if exists "Auth write contents" on public.prompt_contents;
drop policy if exists "Auth read premium if pro" on public.prompt_contents;
drop policy if exists "Public read contents" on public.prompt_contents;

-- 1. Read Policy: Allow reading if Free, or Purchased, or Pro Subscriber, or Admin
create policy "Allow read contents"
  on public.prompt_contents for select
  using (
    -- 1a. Free prompts are readable by anyone
    exists (
      select 1 from public.prompts
      where prompts.id = prompt_contents.prompt_id
      and prompts.tier = 'free'
    )
    OR
    -- 1b. Or the user purchased this specific prompt
    exists (
      select 1 from public.purchases
      where purchases.prompt_id = prompt_contents.prompt_id
      and purchases.user_id = auth.jwt() ->> 'sub'
    )
    OR
    -- 1c. Or the user has an active Pro subscription
    exists (
      select 1 from public.user_subscriptions
      where user_subscriptions.user_id = auth.jwt() ->> 'sub'
      and user_subscriptions.status = 'active'
      and user_subscriptions.tier = 'pro'
    )
    OR
    -- 1d. Or the user is an admin
    (auth.jwt() ->> 'email' in ('akashkumar7653099@gmail.com', 'aloksivastava1025@gmail.com'))
  );

-- 2. Write Policy: ONLY Admins can insert/update/delete contents
create policy "Admins write contents"
  on public.prompt_contents for all
  using (
    auth.jwt() ->> 'email' in ('akashkumar7653099@gmail.com', 'aloksivastava1025@gmail.com')
  )
  with check (
    auth.jwt() ->> 'email' in ('akashkumar7653099@gmail.com', 'aloksivastava1025@gmail.com')
  );
