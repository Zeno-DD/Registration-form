create extension if not exists pgcrypto;

-- Public-safe catalog. Only topic/advisor/availability is exposed.
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  advisor text not null,
  occupied boolean not null default false,
  source text not null default 'website' check (source in ('pdf','website')),
  created_at timestamptz not null default now()
);

-- Private registration data. Never expose this table to anon users.
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null unique references public.topics(id),
  student_name text not null,
  student_code text not null,
  email text not null,
  phone text not null,
  advisor text not null,
  topic_title text not null,
  source text not null default 'website' check (source in ('pdf','website')),
  created_at timestamptz not null default now()
);

alter table public.topics enable row level security;
alter table public.registrations enable row level security;

-- Public users can only read the safe topic catalog.
drop policy if exists "public read topic catalog" on public.topics;
create policy "public read topic catalog" on public.topics
  for select to anon, authenticated using (true);

-- No public policies on registrations. Server API uses service-role key.
-- Realtime should be enabled only for topics, not registrations.
