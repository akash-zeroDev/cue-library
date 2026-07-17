create table if not exists public.user_subscriptions (
  user_id text primary key,
  tier text not null default 'pro',
  status text not null default 'active',
  subscription_id text,
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;

-- Admin/Service Role bypasses RLS naturally. 
-- Users can read their own subscription status
drop policy if exists "Users can read own subscription" on public.user_subscriptions;
create policy "Users can read own subscription"
  on public.user_subscriptions for select
  using (auth.jwt() ->> 'sub' = user_id);

-- Unlock all premium prompts for Pro subscribers
drop policy if exists "Auth read premium if pro" on public.prompt_contents;
create policy "Auth read premium if pro"
  on public.prompt_contents for select
  using (
    exists (
      select 1 from public.user_subscriptions
      where user_subscriptions.user_id = auth.jwt() ->> 'sub'
      and user_subscriptions.status = 'active'
      and user_subscriptions.tier = 'pro'
    )
  );
