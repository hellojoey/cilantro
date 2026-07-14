-- Cilantro v4 — Fine Print 2.0: cited sources with differing perspectives
-- Fine print = neutral clarifier/details shown beneath the question card.
-- Sources = real articles/references (added by the Phase B research pipeline,
-- admin-approved) letting the user read multiple points of view before answering.
-- Shape: [{ "title": text, "publisher": text, "url": text, "perspective": text }]

alter table public.questions
  add column if not exists fine_print_sources jsonb not null default '[]'::jsonb;

alter table public.garden_items
  add column if not exists fine_print_sources jsonb not null default '[]'::jsonb;
