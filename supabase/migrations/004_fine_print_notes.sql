-- Cilantro v4 — Fine Print "Notes" layer (see Obsidian: Fine Print Spec.md)
-- Extensive-but-bounded background per question: 1-2 short paragraphs of
-- factual, attributable, neutral context. Produced by the Phase B research
-- pipeline, admin-approved, rendered behind a second "read more" expansion.

alter table public.questions
  add column if not exists fine_print_notes text;

alter table public.garden_items
  add column if not exists fine_print_notes text;
