// One-time migration of a user's localStorage game data into Supabase.
// Runs after the first successful login/signup when the account has no
// answers in the DB yet. Best-effort: any failure is logged and swallowed
// so it never blocks the app.

import { typeToVibeMigration } from '../data/questions';

const MIGRATED_KEY = 'cilantro_migrated_v4';

// Read + JSON.parse a localStorage value, falling back on any error.
const readLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(`cilantro_${key}`);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

// Local calendar date → YYYY-MM-DD (matches the profile `date` columns).
const pad = (n) => String(n).padStart(2, '0');
const toDateKey = (v) => {
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return isNaN(d.getTime())
    ? null
    : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Coerce any legacy answer value to one the DB check constraint accepts.
const normalizeAnswer = (a) => (a === 'yes' || a === 'no' ? a : 'reflected');

// Resolve a vibe string, applying the legacy type→vibe map when needed.
const resolveVibe = (a) =>
  a.vibe || typeToVibeMigration[a.type] || a.type || 'reflection';

/**
 * Upload localStorage data to Supabase for `userId`.
 * Returns true if it actually uploaded data (so the caller can refetch),
 * false if there was nothing to migrate or it was already done.
 */
export async function migrateLocalData(supabase, userId) {
  try {
    if (localStorage.getItem(MIGRATED_KEY) === 'true') return false;

    const answers = readLS('answers', []) || [];
    const seeds = readLS('seeds', null);
    const gardenUnlocks = readLS('gardenUnlocks', {}) || {};
    const gardenCompletions = readLS('gardenCompletions', {}) || {};
    const skipped = readLS('skipped', []) || [];
    const dailyStreak = readLS('dailyStreak', null);
    const dailyAnswered = readLS('dailyAnswered', null);

    const hasData =
      answers.length > 0 ||
      seeds != null ||
      Object.keys(gardenUnlocks).length > 0 ||
      Object.keys(gardenCompletions).length > 0 ||
      skipped.length > 0;

    if (!hasData) {
      localStorage.setItem(MIGRATED_KEY, 'true');
      return false;
    }

    // ── Answers ──
    if (answers.length > 0) {
      const rows = answers.map((a) => {
        const timestamp = a.timestamp || new Date().toISOString();
        return {
          id: crypto.randomUUID(),
          user_id: userId,
          question_text: a.text ?? '',
          vibe: resolveVibe(a),
          difficulty: a.difficulty ?? 1,
          garden_id: a.gardenId ?? null,
          garden_name: a.gardenName ?? null,
          answer: normalizeAnswer(a.answer),
          source: a.gardenId ? 'garden' : 'free',
          history: Array.isArray(a.history) ? a.history : [],
          created_at: timestamp,
          updated_at: a.updatedAt || timestamp,
        };
      });
      const { error } = await supabase.from('answers').insert(rows);
      if (error) console.error('[migrate] answers insert failed', error);
    }

    // ── Profile: seeds + daily state ──
    const profilePatch = {};
    if (seeds != null) profilePatch.seeds = Math.max(0, seeds);
    if (dailyStreak) {
      profilePatch.daily_streak_count = dailyStreak.count ?? 0;
      profilePatch.daily_streak_last_date = toDateKey(dailyStreak.lastDate);
    }
    if (dailyAnswered) {
      profilePatch.daily_answered_count = dailyAnswered.count ?? 0;
      profilePatch.daily_answered_date = toDateKey(dailyAnswered.date);
    }
    if (Object.keys(profilePatch).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(profilePatch)
        .eq('id', userId);
      if (error) console.error('[migrate] profile update failed', error);
    }

    // ── Garden states (unlock + progress merged per garden) ──
    const gardenMap = {};
    Object.keys(gardenUnlocks).forEach((gid) => {
      if (gardenUnlocks[gid]) gardenMap[gid] = { unlocked: true, progress: 0 };
    });
    Object.keys(gardenCompletions).forEach((gid) => {
      gardenMap[gid] = {
        unlocked: gardenMap[gid]?.unlocked ?? false,
        progress: gardenCompletions[gid] ?? 0,
      };
    });
    const gardenRows = Object.entries(gardenMap).map(([gid, v]) => ({
      user_id: userId,
      garden_id: gid,
      unlocked: v.unlocked,
      progress: v.progress,
    }));
    if (gardenRows.length > 0) {
      const { error } = await supabase
        .from('garden_states')
        .upsert(gardenRows, { onConflict: 'user_id,garden_id' });
      if (error) console.error('[migrate] garden_states upsert failed', error);
    }

    // ── Skips ──
    if (skipped.length > 0) {
      const skipRows = skipped.map((s) => ({
        user_id: userId,
        question_text: typeof s === 'string' ? s : s.text ?? '',
        vibe: typeof s === 'string' ? null : s.vibe ?? null,
      }));
      const { error } = await supabase.from('skips').insert(skipRows);
      if (error) console.error('[migrate] skips insert failed', error);
    }

    localStorage.setItem(MIGRATED_KEY, 'true');
    return true;
  } catch (e) {
    console.error('[migrate] migrateLocalData failed', e);
    return false;
  }
}
