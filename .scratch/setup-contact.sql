create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  inquiry_type text,
  custom_inquiry text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Allow anyone to insert (no auth required)
create policy "Public insert"
  on public.contact_messages for insert
  with check (true);

-- Only authenticated users (admins) can view
create policy "Auth select"
  on public.contact_messages for select
  using (auth.role() = 'authenticated');
