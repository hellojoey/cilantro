// Garden coverage — the shared kernel for branch-based gardens.
// Pure functions only: no context, no React, no data imports.
// Coverage = which garden items the user has already met (answered yes/no,
// or sat with via "reflected"). Tallies count only yes/no — a reflection is
// presence, not a position.
//
// Legacy garden answers (pre-roots) carry no questionSlug, so matching falls
// back to normalized text — which is why live garden question text must never
// be edited.

export const normalize = (text) => (text || '').toLowerCase().replace(/\s+/g, ' ').trim();

const isCovering = (a) =>
  a && (a.answer === 'yes' || a.answer === 'no' || a.answer === 'reflected');

// gardenCoverage(garden, answers) → {
//   byBranch: [{ key, name, total, answered, yes, no }],   // in garden order, incl. empty branches
//   total, answered,                                       // across all branch items (root excluded)
//   answeredIds: Set<itemId>,                              // legacy text matches resolve to item ids
//   branchesCovered,                                       // every non-empty branch fully answered
//   rootUnlocked,                                          // has a root AND branchesCovered
//   rootAnswer: 'yes' | 'no' | null,
// }
export function gardenCoverage(garden, answers = []) {
  const branches = garden.branches || [];
  const forGarden = answers.filter((a) => a.gardenId === garden.id);

  const bySlug = new Map();
  const byText = new Map();
  for (const a of forGarden) {
    if (a.questionSlug) bySlug.set(a.questionSlug, a);
    byText.set(normalize(a.text), a);
  }
  const answerFor = (item) =>
    bySlug.get(item.id) || byText.get(normalize(item.text)) || null;

  const answeredIds = new Set();
  const byBranch = branches.map((b) => {
    let answered = 0;
    let yes = 0;
    let no = 0;
    for (const item of b.items) {
      const a = answerFor(item);
      if (isCovering(a)) {
        answered++;
        answeredIds.add(item.id);
        if (a.answer === 'yes') yes++;
        else if (a.answer === 'no') no++;
      }
    }
    return { key: b.key, name: b.name, total: b.items.length, answered, yes, no };
  });

  const total = byBranch.reduce((s, b) => s + b.total, 0);
  const answered = byBranch.reduce((s, b) => s + b.answered, 0);
  const nonEmpty = byBranch.filter((b) => b.total > 0);
  const branchesCovered = nonEmpty.length > 0 && nonEmpty.every((b) => b.answered === b.total);

  let rootAnswer = null;
  if (garden.root) {
    const r = bySlug.get(garden.root.id) || byText.get(normalize(garden.root.text)) || null;
    if (r && (r.answer === 'yes' || r.answer === 'no')) rootAnswer = r.answer;
  }

  return {
    byBranch,
    total,
    answered,
    answeredIds,
    branchesCovered,
    rootUnlocked: Boolean(garden.root) && branchesCovered,
    rootAnswer,
  };
}

// First item in a branch the user hasn't covered yet (resumability).
export function firstUnansweredIndex(branch, answeredIds) {
  const i = branch.items.findIndex((item) => !answeredIds.has(item.id));
  return i === -1 ? 0 : i;
}
