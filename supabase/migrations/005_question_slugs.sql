-- Cilantro v4 — v3.1+ question-bank ids ("deep-042") get a persisted home.
-- The Mirror engine (contradictions, echoes) keys on these string ids; the
-- answers table's own id stays a UUID primary key.

alter table public.questions
  add column if not exists slug text unique;

alter table public.answers
  add column if not exists question_slug text,
  add column if not exists revisited boolean not null default false;

create index if not exists answers_question_slug_idx
  on public.answers(user_id, question_slug) where question_slug is not null;
