-- Cilantro v4 — Phase B (AI pipeline) schema support
--
-- Deliberately small. 001-005 already cover most of what the pipeline needs:
--   · questions.status already allows 'pending'  → no new draft column
--   · questions.source already allows 'ai'       → no new provenance column
--   · fine_print / fine_print_notes / fine_print_sources / tags / related_gardens
--     all exist from 002-004                      → nothing to add for the dossier
--
-- Two things were genuinely missing.

-- ══════════════════════════════════════════════════════════════
-- 1. DAILY READINGS — let a user write their own reading
--
-- 001 created daily_readings with a SELECT policy only, on the assumption that
-- readings would be written server-side with the service_role key. The Phase B
-- functions instead act as the calling user (their JWT, their RLS), so that no
-- service_role key has to exist in the project at all — a key that bypasses RLS
-- entirely is a much larger blast radius than the row it would be writing.
--
-- Scope: a reading is self-scoped and readable only by its owner, so the worst a
-- user can do by calling this directly is write their own reading text.
-- ══════════════════════════════════════════════════════════════
-- (drop-then-create so this file is safe to re-run, like 002-005)
drop policy if exists "readings own insert" on public.daily_readings;
create policy "readings own insert" on public.daily_readings
  for insert with check (user_id = auth.uid());

drop policy if exists "readings own update" on public.daily_readings;
create policy "readings own update" on public.daily_readings
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════
-- 2. AI GENERATIONS — audit trail
--
-- Every model call the pipeline makes leaves a row: who ran it, which model, what
-- came back, how many tokens. For fine print it also records how many sources were
-- kept vs. dropped by the real-URL guard, which is the audit surface for the
-- "sources must be real" directive — a rising dropped count means the model is
-- trying to cite from memory.
--
-- Stores counts and metadata only. Never prompts, never answer text, never keys.
-- ══════════════════════════════════════════════════════════════
create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('questions','daily_reading','fine_print')),
  model text not null,
  target_question_id uuid references public.questions(id) on delete set null,
  request jsonb not null default '{}'::jsonb,   -- sanitised params only
  result jsonb not null default '{}'::jsonb,    -- counts, ids, kept/dropped
  usage jsonb not null default '{}'::jsonb,     -- token usage
  web_search_used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists ai_generations_actor_idx
  on public.ai_generations(actor_id, created_at desc);
create index if not exists ai_generations_kind_idx
  on public.ai_generations(kind, created_at desc);

alter table public.ai_generations enable row level security;

-- Callers write their own rows; admins read everything.
drop policy if exists "ai generations own insert" on public.ai_generations;
create policy "ai generations own insert" on public.ai_generations
  for insert with check (actor_id = auth.uid());

drop policy if exists "ai generations read" on public.ai_generations;
create policy "ai generations read" on public.ai_generations
  for select using (actor_id = auth.uid() or public.is_admin());
