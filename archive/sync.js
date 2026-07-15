// Cilantro - cloud sync layer
// Offline-first: localStorage stays the source the UI renders from; this
// module mirrors it to Supabase. Answers upsert idempotently via client_key,
// so retries and re-logins can never duplicate a reflection.

import { supabase } from './supabase';

const PUSH_CHUNK = 200;

// Stable identity for an answer across devices. timestamp is immutable
// (changeAnswer only touches updatedAt), so the key survives edits.
export const clientKey = (a) =>
  `${a.timestamp}|${(a.id || (a.text || '').toLowerCase().replace(/\s+/g, ' ').trim()).slice(0, 80)}`;

const toRow = (userId, a) => ({
  user_id: userId,
  client_key: clientKey(a),
  question_id: a.id || null,
  text: a.text,
  vibe: a.vibe || null,
  difficulty: a.difficulty || null,
  answer: a.answer,
  garden_id: a.gardenId || null,
  garden_name: a.gardenName || null,
  revisited: a.revisited || false,
  history: a.history || null,
  answered_at: a.timestamp,
  updated_at: a.updatedAt || null,
});

const fromRow = (r) => {
  const a = {
    text: r.text,
    vibe: r.vibe || undefined,
    difficulty: r.difficulty || undefined,
    answer: r.answer,
    timestamp: r.answered_at,
  };
  if (r.question_id) a.id = r.question_id;
  if (r.garden_id) a.gardenId = r.garden_id;
  if (r.garden_name) a.gardenName = r.garden_name;
  if (r.revisited) a.revisited = true;
  if (r.history) a.history = r.history;
  if (r.updated_at) a.updatedAt = r.updated_at;
  return a;
};

// ── Answers ──

export const fetchAnswers = async (userId) => {
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('user_id', userId)
    .order('answered_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const pushAnswers = async (userId, answers) => {
  for (let i = 0; i < answers.length; i += PUSH_CHUNK) {
    const rows = answers.slice(i, i + PUSH_CHUNK).map((a) => toRow(userId, a));
    const { error } = await supabase
      .from('answers')
      .upsert(rows, { onConflict: 'user_id,client_key' });
    if (error) throw error;
  }
};

// ── App state ──

export const fetchState = async (userId) => {
  const { data, error } = await supabase
    .from('app_state')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const pushState = async (userId, local) => {
  const { error } = await supabase.from('app_state').upsert({
    user_id: userId,
    seeds: local.seeds,
    garden_unlocks: local.gardenUnlocks,
    garden_completions: local.gardenCompletions,
    daily_streak: local.dailyStreak,
    daily_answered: local.dailyAnswered,
    skipped: local.skippedQuestions,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
};

// ── Initial sync on login ──
// Two jobs: migrate local-only history up, and pull remote history down.
// Answers merge as a union by client_key. For state, the server wins once a
// row exists — except garden unlocks/completions, which union/max so nothing
// paid-for ever disappears.
export const initialSync = async (userId, local) => {
  const remoteRows = await fetchAnswers(userId);
  const remoteKeys = new Set(remoteRows.map((r) => `${r.answered_at}|${(r.question_id || (r.text || '').toLowerCase().replace(/\s+/g, ' ').trim()).slice(0, 80)}`));
  const localKeys = new Set(local.answers.map(clientKey));

  const toPush = local.answers.filter((a) => !remoteKeys.has(clientKey(a)));
  if (toPush.length) await pushAnswers(userId, toPush);

  const toMerge = remoteRows.filter((r) => !localKeys.has(clientKey(fromRow(r))));
  let mergedAnswers = null;
  if (toMerge.length) {
    mergedAnswers = [...local.answers, ...toMerge.map(fromRow)]
      .sort((x, y) => Date.parse(x.timestamp) - Date.parse(y.timestamp));
  }

  const remoteState = await fetchState(userId);
  let mergedState = null;
  if (remoteState) {
    const unlocks = { ...remoteState.garden_unlocks, ...local.gardenUnlocks };
    const completions = { ...remoteState.garden_completions };
    Object.entries(local.gardenCompletions || {}).forEach(([k, v]) => {
      completions[k] = Math.max(completions[k] || 0, v);
    });
    const localStreakDate = local.dailyStreak?.lastDate ? Date.parse(local.dailyStreak.lastDate) : 0;
    const remoteStreakDate = remoteState.daily_streak?.lastDate ? Date.parse(remoteState.daily_streak.lastDate) : 0;
    mergedState = {
      seeds: remoteState.seeds,
      gardenUnlocks: unlocks,
      gardenCompletions: completions,
      dailyStreak: remoteStreakDate >= localStreakDate ? remoteState.daily_streak : local.dailyStreak,
      dailyAnswered: remoteState.daily_answered || local.dailyAnswered,
      skippedQuestions: remoteState.skipped?.length ? remoteState.skipped : local.skippedQuestions,
    };
  } else {
    // First device to sync — server state is born from this device
    await pushState(userId, local);
  }

  return { answers: mergedAnswers, state: mergedState };
};
