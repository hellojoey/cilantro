# Archived: the v3.4 cloud-sync prototype (Jun 12, 2026)

Recovered from the Obsidian vault working copy before it was deleted. This is the
**road not taken** — an approach v4 deliberately replaced. Nothing here is wired
into the app, and this branch is never meant to be merged.

- `sync.js` — an **offline-first** sync layer: localStorage stays the source the UI
  renders from, and this mirrors it to Supabase. Answers upsert idempotently via a
  `client_key` derived from the immutable timestamp.
- `schema.sql` — the matching v3.4 schema. Note the header: *"User identity lives in
  auth.users.user_metadata — no profiles table."*

**Why v4 went elsewhere:** v4 is cloud write-through (Postgres is the source of
truth, not a mirror) and it needs a real `profiles` table — for `is_admin`, seeds,
and RLS policies that key off `auth.uid()`. Both premises here are inverted.

Kept because it was the only copy in existence. Safe to delete this branch if the
idea never comes back.
