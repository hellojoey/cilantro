# Supabase Setup — Joey's Checklist (~10 minutes)

Do these once; everything else is already coded.

## 1. Create the project
1. Go to https://supabase.com → sign in (GitHub login is easiest).
2. **New project** → name it `cilantro`, pick a strong database password (save it in your password manager), region closest to you (e.g. US West).
3. Wait ~2 minutes for provisioning.

## 2. Run the schema
1. In the Supabase dashboard: **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/migrations/001_init.sql` → **Run**. Should say "Success".
3. New query → paste `supabase/migrations/002_fine_print_sources.sql` → **Run**. (Safe to run even if you did step 2 earlier — it only adds columns.)
4. New query → paste `supabase/migrations/003_tags_and_garden_ties.sql` → **Run**. (Also just adds columns.)
5. New query → paste `supabase/migrations/004_fine_print_notes.sql` → **Run**. (Also just adds columns.)

## 3. Seed the content
1. New query → paste the contents of `supabase/seed.sql` → **Run**.
2. Sanity check: **Table Editor** → `questions` should show ~200 rows, `gardens` 8, `garden_items` ~80.

## 4. Get your API keys
1. **Project Settings** (gear) → **API**.
2. Copy **Project URL** and the **anon public** key (NOT the service_role key).

## 5. Local env
Create `cilantro-app/.env.local` (it's gitignored):
```
VITE_SUPABASE_URL=<Project URL>
VITE_SUPABASE_ANON_KEY=<anon public key>
```

## 6. Vercel env
1. Vercel dashboard → cilantro project → **Settings → Environment Variables**.
2. Add the same two vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) for Production + Preview.

## 7. Make yourself admin
After you sign up in the app with your real email, run in SQL Editor:
```sql
update public.profiles set is_admin = true where username = 'YOUR_USERNAME';
```

## Notes
- The anon key is safe to expose in the frontend — row-level security is what protects data.
- The service_role key (used later for AI features) must NEVER go in frontend env vars.
- Auth → Providers: email/password is on by default. Consider turning OFF "Confirm email" during testing (Auth → Sign In / Up → Email) so signups work instantly, then re-enable for launch.
