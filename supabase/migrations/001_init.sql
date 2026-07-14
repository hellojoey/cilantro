-- Cilantro v4 — initial schema
-- Run this in the Supabase SQL Editor (or via supabase db push).

-- ══════════════════════════════════════════════════════════════
-- PROFILES — one row per auth user, created by trigger on signup
-- ══════════════════════════════════════════════════════════════
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  username text unique not null,
  is_admin boolean not null default false,
  seeds integer not null default 0 check (seeds >= 0),
  -- Daily 30 state
  daily_streak_count integer not null default 0,
  daily_streak_last_date date,
  daily_answered_count integer not null default 0,
  daily_answered_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ══════════════════════════════════════════════════════════════
-- QUESTIONS — global pool (seeded + admin-approved) and, later,
-- per-user AI-generated questions (owner_id set, Phase B)
-- ══════════════════════════════════════════════════════════════
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  vibe text not null,
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  fine_print text,                       -- neutral clarifier, Phase B backfill
  source text not null default 'seed' check (source in ('seed','ai','admin')),
  status text not null default 'published' check (status in ('draft','pending','published','rejected')),
  owner_id uuid references public.profiles(id) on delete cascade,  -- null = global
  created_at timestamptz not null default now()
);
create index questions_owner_idx on public.questions(owner_id) where owner_id is not null;
create index questions_status_idx on public.questions(status);

-- ══════════════════════════════════════════════════════════════
-- GARDENS + ITEMS — premium mixed-content collections
-- ══════════════════════════════════════════════════════════════
create table public.gardens (
  id text primary key,                   -- slug: 'shadows', 'mirrors', ...
  name text not null,
  description text not null default '',
  icon text not null default '',
  color text not null default '#a8a29e',
  seed_cost integer not null default 100,
  tier smallint not null default 1,
  status text not null default 'published' check (status in ('draft','pending','published','rejected')),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.garden_items (
  id uuid primary key default gen_random_uuid(),
  garden_id text not null references public.gardens(id) on delete cascade,
  position integer not null,
  content_type text not null check (content_type in ('question','quote','vibe')),
  text text not null,
  attribution text,                      -- quotes only
  vibe text,
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  fine_print text,
  unique (garden_id, position)
);

-- ══════════════════════════════════════════════════════════════
-- ANSWERS — question snapshot + answer; history preserved as jsonb
-- ══════════════════════════════════════════════════════════════
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid references public.questions(id) on delete set null,  -- optional link
  question_text text not null,
  vibe text not null default 'reflection',
  difficulty smallint not null default 1,
  garden_id text,
  garden_name text,
  answer text not null check (answer in ('yes','no','reflected')),
  source text not null default 'free' check (source in ('free','garden','daily30')),
  history jsonb not null default '[]'::jsonb,   -- [{answer, timestamp}] on changes
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index answers_user_idx on public.answers(user_id, created_at desc);

-- ══════════════════════════════════════════════════════════════
-- GARDEN STATES — per-user unlock + progress
-- ══════════════════════════════════════════════════════════════
create table public.garden_states (
  user_id uuid not null references public.profiles(id) on delete cascade,
  garden_id text not null references public.gardens(id) on delete cascade,
  unlocked boolean not null default false,
  progress integer not null default 0,
  completed_at timestamptz,
  primary key (user_id, garden_id)
);

-- ══════════════════════════════════════════════════════════════
-- SKIPS — skipped free-play questions (snapshot)
-- ══════════════════════════════════════════════════════════════
create table public.skips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_text text not null,
  vibe text,
  created_at timestamptz not null default now()
);

-- ══════════════════════════════════════════════════════════════
-- DAILY READINGS — AI reflections on a day's answers (Phase B)
-- ══════════════════════════════════════════════════════════════
create table public.daily_readings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  reading_date date not null,
  body text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, reading_date)
);

-- ══════════════════════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- first_name / username come from auth signup metadata
-- ══════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || left(new.id::text, 4))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ══════════════════════════════════════════════════════════════
-- ADMIN CHECK — security definer to avoid recursive RLS on profiles
-- ══════════════════════════════════════════════════════════════
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Users see/modify only their own data; admin reads everything;
-- content tables are world-readable when published, admin-writable.
-- ══════════════════════════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.gardens enable row level security;
alter table public.garden_items enable row level security;
alter table public.answers enable row level security;
alter table public.garden_states enable row level security;
alter table public.skips enable row level security;
alter table public.daily_readings enable row level security;

-- profiles
create policy "own profile read" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "own profile update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid()));

-- questions: published global questions are readable by all signed-in users;
-- personal AI questions readable by owner; admin sees all
create policy "questions read" on public.questions for select
  using (
    (status = 'published' and owner_id is null)
    or owner_id = auth.uid()
    or public.is_admin()
  );
create policy "questions admin write" on public.questions for insert with check (public.is_admin());
create policy "questions admin update" on public.questions for update using (public.is_admin());
create policy "questions admin delete" on public.questions for delete using (public.is_admin());

-- gardens + items: published readable by all signed-in; admin full control
create policy "gardens read" on public.gardens for select using (status = 'published' or public.is_admin());
create policy "gardens admin write" on public.gardens for insert with check (public.is_admin());
create policy "gardens admin update" on public.gardens for update using (public.is_admin());
create policy "gardens admin delete" on public.gardens for delete using (public.is_admin());

create policy "garden items read" on public.garden_items for select
  using (exists (select 1 from public.gardens g where g.id = garden_id and (g.status = 'published' or public.is_admin())));
create policy "garden items admin write" on public.garden_items for insert with check (public.is_admin());
create policy "garden items admin update" on public.garden_items for update using (public.is_admin());
create policy "garden items admin delete" on public.garden_items for delete using (public.is_admin());

-- answers / garden_states / skips / daily_readings: own rows; admin reads
create policy "answers own" on public.answers for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "answers admin read" on public.answers for select using (public.is_admin());

create policy "garden states own" on public.garden_states for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "garden states admin read" on public.garden_states for select using (public.is_admin());

create policy "skips own" on public.skips for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "skips admin read" on public.skips for select using (public.is_admin());

create policy "readings own read" on public.daily_readings for select using (user_id = auth.uid() or public.is_admin());
-- readings are written server-side (service role) in Phase B; no user insert policy
