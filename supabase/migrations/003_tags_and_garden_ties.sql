-- Cilantro v4 — Fine Print: topic hashtags + associated-garden ties
-- tags: lowercase topic hashtags shown in the fine print panel (no '#' stored)
-- related_gardens: garden ids this question thematically connects to; the
-- fine print panel renders them as tappable garden thumbnails

alter table public.questions
  add column if not exists tags text[] not null default '{}',
  add column if not exists related_gardens text[] not null default '{}';

alter table public.garden_items
  add column if not exists tags text[] not null default '{}',
  add column if not exists related_gardens text[] not null default '{}';
