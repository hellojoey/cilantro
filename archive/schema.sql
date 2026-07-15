-- Cilantro cloud schema (v3.4)
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- User identity (first name, username) lives in auth.users.user_metadata — no profiles table.

-- ── Answers: the longitudinal record of the self ──
create table public.answers (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  client_key text not null,          -- idempotency key from the client: "<answered_at>|<question id or text>"
  question_id text,                  -- bank id like "deep-042"; null for garden/legacy answers
  text text not null,
  vibe text,
  difficulty int,
  answer text not null,              -- 'yes' | 'no' | 'reflected'
  garden_id text,
  garden_name text,
  revisited boolean default false,
  history jsonb,                     -- prior answers: [{answer, timestamp}]
  answered_at timestamptz not null,
  updated_at timestamptz,
  unique (user_id, client_key)
);

create index answers_user_time on public.answers (user_id, answered_at);

-- ── App state: one row per user (seeds, unlocks, streaks) ──
create table public.app_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  seeds int not null default 0,
  garden_unlocks jsonb not null default '{}',
  garden_completions jsonb not null default '{}',
  daily_streak jsonb,
  daily_answered jsonb,
  skipped jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- ── Row-level security: users touch only their own rows ──
alter table public.answers enable row level security;
alter table public.app_state enable row level security;

create policy "answers are own" on public.answers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "state is own" on public.app_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
