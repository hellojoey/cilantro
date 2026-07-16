// Cilantro - The Portrait: describe, don't score.
// Reads your answers back to you as plain sentences about where you lean and
// where your attention goes — never a verdict, never a virtue axis, no AI.
// All functions are pure: they take the answers array (and skips) and return data.

import { questionCategories } from '../data/questions';
import { getQuestionMeta } from '../data/questionMeta';
import { findMirrorMoments } from './insights';

// Same normalization insights.js uses, so pre-v3.1 answers (matched on text,
// before questions carried ids) resolve to the same bucket.
const normalize = (text) => (text || '').toLowerCase().replace(/\s+/g, ' ').trim();

// Capitalize the first letter — the card renders these as sentences.
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// ── Bank-derived category lookup ──
// Answer records carry only { text, vibe, questionSlug? } — never a category.
// Build two maps from the question bank so we can recover a topic when a
// question has no hashtags yet: id → category, normalized text → category.
const idToCategory = new Map();
const textToCategory = new Map();
questionCategories.forEach((cat) => {
  cat.questions.forEach((q) => {
    idToCategory.set(q.id, cat.slug);
    textToCategory.set(normalize(q.text), cat.slug);
  });
});

// Friendlier prose labels for the eight bank categories. Only used when a
// question has no hashtags — tags (which cover ~14% today, ~2,000 after the
// fine-print bake) are already human-readable and pass through untouched.
const CATEGORY_LABEL = {
  deep: 'deep questions',
  light: 'lighthearted things',
  social: 'relationships',
  pop: 'pop culture',
  trivia: 'trivia',
  wellness: 'daily wellness',
  creativity: 'creativity',
  growth: 'growth',
};

// Resolve the bank category for a record: questionSlug → id map (Supabase-era
// answers carry the bank id there; their own `id` is a row UUID), else the
// normalized-text map, else null.
const categoryOf = (record) => {
  const qid = record.questionSlug || record.id;
  if (qid && idToCategory.has(qid)) return idToCategory.get(qid);
  return textToCategory.get(normalize(record.text)) || null;
};

// ── topicsOf: every topic a record touches ──
// Tags first (a question about peace/emotions/mindfulness feeds all three
// buckets, matching Profile's #tag chips), else the category fallback, else —
// only when asked, for skips that predate the bank — the raw vibe family.
// Returns [] when nothing resolves, so untagged records drop out of the math.
export const topicsOf = (record, { vibeFallback = false } = {}) => {
  const tags = getQuestionMeta(record.text).tags;
  if (tags.length) return tags;
  const cat = categoryOf(record);
  if (cat) return [CATEGORY_LABEL[cat] || cat];
  if (vibeFallback && record.vibe) return [record.vibe];
  return [];
};

// topicOf: a record's single primary topic (first tag, else category), or null.
export const topicOf = (record) => {
  const topics = topicsOf(record);
  return topics.length ? topics[0] : null;
};

// ── Portrait: 0–6 plain sentences describing your reflections ──
// Deterministic. Silence over noise — a line only appears when the data clearly
// supports it. Prefers fewer, truer lines.
export const portrait = (answers, skippedQuestions = []) => {
  const lines = [];
  if (answers.length < 10) return lines;

  // Only real yes/no answers count toward leans — 'reflected' quote/vibe items
  // have no direction (same exclusion latestAnswers makes).
  const yn = answers.filter((a) => a.answer === 'yes' || a.answer === 'no');

  // 1. Yes/no lean — overall, with the strongest topic exception.
  // Per-topic tally; an answer counts toward each of its topics.
  const topicTally = new Map(); // topic → { yes, total }
  yn.forEach((a) => {
    topicsOf(a).forEach((topic) => {
      const t = topicTally.get(topic) || { yes: 0, total: 0 };
      if (a.answer === 'yes') t.yes++;
      t.total++;
      topicTally.set(topic, t);
    });
  });

  // Topics lopsided enough to describe: n >= 5 and a >= 65/35 lean.
  const leaned = [...topicTally.entries()]
    .filter(([, t]) => t.total >= 5)
    .map(([topic, t]) => ({ topic, ratio: t.yes / t.total }))
    .filter((t) => t.ratio >= 0.65 || t.ratio <= 0.35)
    .sort((a, b) => Math.abs(b.ratio - 0.5) - Math.abs(a.ratio - 0.5));

  if (yn.length) {
    const overall = yn.filter((a) => a.answer === 'yes').length / yn.length;
    if (overall >= 0.6 || overall <= 0.4) {
      const overallYes = overall >= 0.6;
      const base = overallYes ? 'you say yes more than no' : 'you say no more than yes';
      // An exception is a topic that leans the *other* way, strongly.
      const exception = leaned.find((t) => (overallYes ? t.ratio <= 0.35 : t.ratio >= 0.65));
      if (exception) {
        lines.push(`${cap(base)} — except about ${exception.topic}, where you mostly say ${overallYes ? 'no' : 'yes'}.`);
      } else {
        lines.push(`${cap(base)}.`);
      }
    } else if (leaned.length) {
      // Near-even overall, but one topic still pulls hard.
      const top = leaned[0];
      lines.push(`Your yes and no come out about even — but on ${top.topic}, you mostly say ${top.ratio >= 0.65 ? 'yes' : 'no'}.`);
    }
  }

  // 2. Where attention goes — most-answered topic against the least.
  // Counts every reflection (quote/vibe items included: attention, not lean).
  const attention = new Map();
  answers.forEach((a) => {
    topicsOf(a).forEach((topic) => attention.set(topic, (attention.get(topic) || 0) + 1));
  });
  const ranked = [...attention.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length >= 3 && ranked[0][1] >= 5) {
    const [mostTopic, mostCount] = ranked[0];
    const [leastTopic, leastCount] = ranked[ranked.length - 1];
    // Only claim "barely touched" when it's genuinely sparse next to the top.
    // Superlative, not majority — the top topic rarely holds most reflections.
    if (mostTopic !== leastTopic && leastCount <= mostCount / 2) {
      lines.push(`You spend the most time with ${mostTopic}; you've barely touched ${leastTopic}.`);
    }
  }

  // 3. Changed minds — ported verbatim from the old Noticing card (virtue-free).
  const changed = answers.filter((a) => a.history && a.history.length > 0).length;
  if (changed > 0) {
    lines.push(
      `You've changed your mind ${changed} ${changed === 1 ? 'time' : 'times'}. That's not inconsistency — that's growth.`
    );
  }

  // 4. Contradictions — active mirror moments, if any.
  // Each moment is a pair of answers, so say "pairs" — and mind the singular.
  const contradictions = findMirrorMoments(answers).length;
  if (contradictions === 1) {
    lines.push('One pair of your answers is quietly disagreeing.');
  } else if (contradictions > 1) {
    lines.push(`${contradictions} pairs of your answers are quietly disagreeing with each other.`);
  }

  // 5. What waits — the current skip queue, when a topic clearly dominates it.
  if (skippedQuestions.length >= 3) {
    const skipTally = new Map();
    skippedQuestions.forEach((s) => {
      topicsOf(s, { vibeFallback: true }).forEach((topic) =>
        skipTally.set(topic, (skipTally.get(topic) || 0) + 1)
      );
    });
    const rankedSkips = [...skipTally.entries()].sort((a, b) => b[1] - a[1]);
    // "Most of them" must be literally true: the top topic covers a strict
    // majority of the queue and beats the runner-up. Otherwise skip the topic.
    if (
      rankedSkips.length &&
      rankedSkips[0][1] * 2 > skippedQuestions.length &&
      (rankedSkips.length === 1 || rankedSkips[0][1] > rankedSkips[1][1])
    ) {
      lines.push(
        `You've left ${skippedQuestions.length} questions waiting — most of them about ${rankedSkips[0][0]}.`
      );
    } else {
      lines.push(`You've left ${skippedQuestions.length} questions waiting.`);
    }
  }

  // (Constancy — echo re-answers that held steady — is deliberately omitted:
  // the data can't distinguish "re-answered the same" cleanly, and a false
  // steadiness line is worse than silence.)

  return lines.slice(0, 6);
};
