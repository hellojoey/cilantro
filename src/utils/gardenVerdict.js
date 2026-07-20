// Garden verdict — reads a garden's answers back as plain, factual lines.
// Describe, don't score: same truthfulness bar as portrait.js. Every clause is
// literally true, counts are counts, and majority words ("mostly") appear only
// when one side is a strict majority of the yes/no answers.
//
// Pure and deterministic: no AI, no React, no data imports. Tallies come from
// the shared kernel (gardenCoverage) so matching + reflected handling live in
// exactly one place — legacy no-slug answers resolve by normalized text there.

import { gardenCoverage } from './gardenCoverage.js';

const LEAN = 0.65; // strict-majority threshold, shared with portrait.js's leans
const MIN_YN = 3; // below this many yes/no answers a lean isn't trustworthy

// gardenVerdict(garden, answers) → {
//   branchLines: [{ key, name, line }],   // only branches with >= 1 answered item
//   preRootLine: string | null,           // non-null only when root is unlocked & unanswered
//   closingLine: string | null,           // non-null only once the root is answered
// }
export function gardenVerdict(garden, answers = []) {
  const coverage = gardenCoverage(garden, answers);

  const branchLines = coverage.byBranch
    .filter((b) => b.answered > 0) // empty and untouched branches drop out
    .map((b) => ({ key: b.key, name: b.name, line: branchLine(b) }));

  // Pooled yes/no across every branch item — the overall lean the root is
  // measured against. Reflections carry no direction, so they're already out.
  let pooledYes = 0;
  let pooledNo = 0;
  for (const b of coverage.byBranch) {
    pooledYes += b.yes;
    pooledNo += b.no;
  }

  const preRootLine =
    coverage.rootUnlocked && !coverage.rootAnswer ? buildPreRootLine(coverage.total) : null;

  const closingLine = coverage.rootAnswer
    ? buildClosingLine(coverage.rootAnswer, pooledYes, pooledNo)
    : null;

  return { branchLines, preRootLine, closingLine };
}

// One factual line per branch. n = yes + no (reflections don't tally).
function branchLine(b) {
  const { name, answered, total, yes, no } = b;
  const n = yes + no;

  // Too little answered to weigh — report progress, not a lean. Only while the
  // branch is genuinely unfinished: a COMPLETE two-question branch has not
  // "only just started", however small it is.
  if (answered < MIN_YN && answered < total) {
    return `On ${name}, you've only just started (${answered} of ${total}).`;
  }
  // "mostly" only when the direction is a strict majority (>= 65%, n >= 3).
  if (n >= MIN_YN && yes / n >= LEAN) {
    return `On ${name}, you said yes ${yes} times out of ${n} — you've mostly been saying yes to this.`;
  }
  if (n >= MIN_YN && no / n >= LEAN) {
    return `On ${name}, you said no ${no} times out of ${n} — you've mostly been saying no to this.`;
  }
  // Split — no strict majority. Counts stand on their own, no majority word.
  if (n >= MIN_YN) {
    return `On ${name}, you're split — ${yes} yes, ${no} no.`;
  }
  // Too few yes/no answers to call anything (tiny branch, or mostly
  // reflections): the counts alone, which are always literally true.
  return `On ${name}, you said ${yes} yes and ${no} no.`;
}

function buildPreRootLine(total) {
  return `You've answered all ${total} questions. Here's where you've been landing — then the garden asks its real question.`;
}

function buildClosingLine(root, pooledYes, pooledNo) {
  const n = pooledYes + pooledNo;
  const leanYes = n > 0 && pooledYes / n >= LEAN;
  const leanNo = n > 0 && pooledNo / n >= LEAN;

  // No strong pooled lean → the small answers never settled on a side.
  if (!leanYes && !leanNo) {
    return `Your ${n} answers never settled on a side (${pooledYes} yes, ${pooledNo} no) — but asked straight, you said ${root}.`;
  }

  const leanDir = leanYes ? 'yes' : 'no';
  // Aligned — the root matches the side most of the small answers landed on.
  // (Deliberately claims only answer direction, not stance: a yes to one
  //  question can cut against a yes to the root — tallies can't see valence.)
  if (root === leanDir) {
    return `You said ${root} — and your ${n} small answers had mostly landed there too (${pooledYes} yes, ${pooledNo} no).`;
  }
  // Crossed — the root runs against a strict pooled lean.
  return `Your small answers leaned ${leanDir} (${pooledYes} yes, ${pooledNo} no) — but asked straight, you said ${root}. Worth sitting with.`;
}
