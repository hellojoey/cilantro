// Cilantro - The Mirror: insight engine
// Reads your answers back to you: contradictions, character drift, echoes.
// All functions are pure — they take the answers array and return data.

import { radarDimensions, vibeToDimensions, calculateRadarScores } from '../data/questions';
import contradictionData from '../data/contradictions.json' with { type: 'json' };

export const contradictionPairs = contradictionData.pairs;

const DAY_MS = 24 * 60 * 60 * 1000;
export const ECHO_MIN_AGE_DAYS = 30;
export const ECHO_FREQUENCY = 8; // try an echo every Nth free-play question

// Normalize question text for matching answers recorded before questions had ids
const normalize = (text) => (text || '').toLowerCase().replace(/\s+/g, ' ').trim();

// ── Latest answer per question ──
// Keyed by question id when present, else normalized text.
// Ignores 'reflected' (quote/vibe) entries. Later entries win.
export const latestAnswers = (answers) => {
  const byId = new Map();
  const byText = new Map();
  answers.forEach((a) => {
    if (a.answer !== 'yes' && a.answer !== 'no') return;
    const entry = { ...a, effectiveTime: a.updatedAt || a.timestamp };
    // Supabase-era answers carry the bank question's string id as questionSlug
    // (their own id is the answers-table row UUID); pre-cloud answers carried
    // the question id directly in `id`.
    const qid = a.questionSlug || a.id;
    if (qid) byId.set(qid, entry);
    byText.set(normalize(a.text), entry);
  });
  return { byId, byText };
};

// Look up the latest answer for a bank question (by id, falling back to text)
const lookupAnswer = (latest, question) =>
  latest.byId.get(question.id) || latest.byText.get(normalize(question.text)) || null;

// ── Mirror Moments: active contradictions ──
// A moment fires when your latest answers to both questions of a curated
// pair match one of the pair's conflict combos.
export const findMirrorMoments = (answers, pairs = contradictionPairs) => {
  if (!answers.length) return [];
  const latest = latestAnswers(answers);
  const moments = [];
  pairs.forEach((pair) => {
    const aEntry = latest.byId.get(pair.a) || latest.byText.get(normalize(pair.aText));
    const bEntry = latest.byId.get(pair.b) || latest.byText.get(normalize(pair.bText));
    if (!aEntry || !bEntry) return;
    const fired = pair.conflict.some(
      ([ansA, ansB]) => aEntry.answer === ansA && bEntry.answer === ansB
    );
    if (fired) moments.push({ pair, aEntry, bEntry });
  });
  // Most recently touched tensions first
  moments.sort((m1, m2) => {
    const t1 = Math.max(Date.parse(m1.aEntry.effectiveTime), Date.parse(m1.bEntry.effectiveTime));
    const t2 = Math.max(Date.parse(m2.aEntry.effectiveTime), Date.parse(m2.bEntry.effectiveTime));
    return t2 - t1;
  });
  return moments;
};

// ── Then vs Now: radar comparison ──
// baseline = answers older than `windowDays`, current = answers within it.
// Comparison only exists once both sides have enough data (3+ per dimension,
// enforced by calculateRadarScores returning null otherwise).
export const radarComparison = (answers, windowDays = 30) => {
  const cutoff = Date.now() - windowDays * DAY_MS;
  const older = answers.filter((a) => Date.parse(a.timestamp) < cutoff);
  const recent = answers.filter((a) => Date.parse(a.timestamp) >= cutoff);

  const allTime = calculateRadarScores(answers);
  const baseline = calculateRadarScores(older);
  const current = calculateRadarScores(recent);

  const hasComparison =
    baseline.some((s) => s !== null) && current.some((s) => s !== null);

  // Per-dimension drift (only where both sides have data)
  const trends = radarDimensions.map((dimension, i) => {
    if (baseline[i] === null || current[i] === null) return { dimension, delta: null };
    return { dimension, delta: current[i] - baseline[i] };
  });

  return { allTime, baseline, current, trends, hasComparison };
};

// ── Echo: resurface an old question ──
// Picks a bank question whose latest answer is at least minAgeDays old,
// so answering it again reveals constancy or drift.
export const getEchoCandidate = (answers, questions, minAgeDays = ECHO_MIN_AGE_DAYS) => {
  if (!answers.length) return null;
  const latest = latestAnswers(answers);
  const cutoff = Date.now() - minAgeDays * DAY_MS;

  const eligible = questions.filter((q) => {
    const entry = lookupAnswer(latest, q);
    return entry && Date.parse(entry.effectiveTime) < cutoff;
  });
  if (!eligible.length) return null;

  const question = eligible[Math.floor(Math.random() * eligible.length)];
  const previous = lookupAnswer(latest, question);
  return {
    question,
    previousAnswer: previous.answer,
    previousTime: previous.effectiveTime,
  };
};

// ── Noticing: gentle template observations from the data ──
export const noticings = (answers) => {
  const lines = [];
  if (answers.length < 10) return lines;

  const { trends, hasComparison } = radarComparison(answers);

  // Biggest character drift
  if (hasComparison) {
    const moved = trends.filter((t) => t.delta !== null && Math.abs(t.delta) >= 10);
    if (moved.length) {
      const top = moved.reduce((a, b) => (Math.abs(b.delta) > Math.abs(a.delta) ? b : a));
      lines.push(
        top.delta > 0
          ? `Your ${top.dimension.toLowerCase()} has been growing lately.`
          : `Your ${top.dimension.toLowerCase()} answers have softened lately — worth sitting with.`
      );
    } else {
      lines.push('Your character has been steady lately — you answer today the way you answered before.');
    }
  }

  // Where your attention goes
  const dimCounts = {};
  answers.forEach((a) => {
    (vibeToDimensions[a.vibe] || []).forEach((d) => {
      dimCounts[d] = (dimCounts[d] || 0) + 1;
    });
  });
  const ranked = Object.entries(dimCounts).sort((x, y) => y[1] - x[1]);
  if (ranked.length >= 2) {
    lines.push(
      `You spend the most time with questions of ${ranked[0][0].toLowerCase()}, and the least with ${ranked[ranked.length - 1][0].toLowerCase()}.`
    );
  }

  // Changed answers = growth, not inconsistency
  const changed = answers.filter((a) => a.history && a.history.length > 0).length;
  if (changed > 0) {
    lines.push(
      `You've changed your mind ${changed} ${changed === 1 ? 'time' : 'times'}. That's not inconsistency — that's growth.`
    );
  }

  return lines;
};
