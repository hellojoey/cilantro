#!/usr/bin/env node
// Headless test for src/utils/gardenVerdict.js.
// The util imports gardenCoverage with an explicit .js extension and neither
// file imports app data, so plain node ESM resolves it — no esbuild bundle
// needed (unlike portrait, which pulls in the question bank).

import { gardenVerdict } from '../src/utils/gardenVerdict.js';

let failures = 0;
const ok = (label, cond) => {
  if (cond) {
    console.log(`✓ ${label}`);
  } else {
    console.error(`✗ ${label}`);
    failures++;
  }
};

// ── Fixtures (no real data imports) ──
// A rooted 3-branch garden: one yes-leaning branch, one no-leaning, one split,
// plus an empty branch and a branch left untouched.
const rooted = {
  id: 'fix',
  name: 'fixture',
  root: { id: 'fix-root', text: 'The straight question?', vibe: 'decision', difficulty: 3 },
  branches: [
    {
      key: 'yeslean',
      name: 'letting in',
      items: [
        { id: 'fix-yes-1', text: 'y1' },
        { id: 'fix-yes-2', text: 'y2' },
        { id: 'fix-yes-3', text: 'y3' },
        { id: 'fix-yes-4', text: 'y4' },
        { id: 'fix-yes-5', text: 'y5' },
      ],
    },
    {
      key: 'nolean',
      name: 'holding back',
      items: [
        { id: 'fix-no-1', text: 'n1' },
        { id: 'fix-no-2', text: 'n2' },
        { id: 'fix-no-3', text: 'n3' },
        { id: 'fix-no-4', text: 'n4' },
      ],
    },
    {
      key: 'split',
      name: 'the fence',
      items: [
        { id: 'fix-sp-1', text: 's1' },
        { id: 'fix-sp-2', text: 's2' },
        { id: 'fix-sp-3', text: 's3' },
        { id: 'fix-sp-4', text: 's4' },
      ],
    },
    { key: 'empty', name: 'nothing here', items: [] },
    {
      key: 'untouched',
      name: 'later',
      items: [{ id: 'fix-un-1', text: 'u1' }],
    },
  ],
};

const ans = (gardenId, questionSlug, answer, text) => ({ gardenId, questionSlug, answer, text });

// yeslean: 4 yes, 1 no (n=5, 80% yes) → yes-lean
// nolean: 1 yes, 3 no (n=4, 75% no) → no-lean
// split: 2 yes, 2 no (n=4, 50%) → split
const baseAnswers = [
  ans('fix', 'fix-yes-1', 'yes', 'y1'),
  ans('fix', 'fix-yes-2', 'yes', 'y2'),
  ans('fix', 'fix-yes-3', 'yes', 'y3'),
  ans('fix', 'fix-yes-4', 'yes', 'y4'),
  ans('fix', 'fix-yes-5', 'no', 'y5'),
  ans('fix', 'fix-no-1', 'yes', 'n1'),
  ans('fix', 'fix-no-2', 'no', 'n2'),
  ans('fix', 'fix-no-3', 'no', 'n3'),
  ans('fix', 'fix-no-4', 'no', 'n4'),
  ans('fix', 'fix-sp-1', 'yes', 's1'),
  ans('fix', 'fix-sp-2', 'yes', 's2'),
  ans('fix', 'fix-sp-3', 'no', 's3'),
  ans('fix', 'fix-sp-4', 'no', 's4'),
];

// ── Case: branch lines, leans, split, omission ──
{
  const { branchLines } = gardenVerdict(rooted, baseAnswers);
  const byKey = Object.fromEntries(branchLines.map((b) => [b.key, b.line]));

  ok(
    'yes-lean line has correct counts, no percent sign',
    byKey.yeslean === "On letting in, you said yes 4 times out of 5 — you've mostly been saying yes to this." &&
      !byKey.yeslean.includes('%')
  );
  ok(
    'no-lean line has correct counts, no percent sign',
    byKey.nolean === "On holding back, you said no 3 times out of 4 — you've mostly been saying no to this." &&
      !byKey.nolean.includes('%')
  );
  ok(
    'split line has both counts present',
    byKey.split === "On the fence, you're split — 2 yes, 2 no." &&
      byKey.split.includes('2 yes') &&
      byKey.split.includes('2 no')
  );
  ok('empty branch omitted from branchLines', !('empty' in byKey));
  ok('untouched branch omitted from branchLines', !('untouched' in byKey));
}

// ── Case: answered < 3 → "just started" form using answered/total ──
{
  const answers = [
    ans('fix', 'fix-yes-1', 'yes', 'y1'),
    ans('fix', 'fix-yes-2', 'no', 'y2'),
  ];
  const { branchLines } = gardenVerdict(rooted, answers);
  const yl = branchLines.find((b) => b.key === 'yeslean');
  ok(
    'answered<3 → just started (answered of total)',
    yl && yl.line === 'On letting in, you\'ve only just started (2 of 5).'
  );
}

// ── Case: a COMPLETE small branch never reads "just started" — counts only ──
{
  const tiny = {
    id: 'tiny',
    root: null,
    branches: [
      {
        key: 'small',
        name: 'small',
        items: [
          { id: 'tiny-1', text: 't1' },
          { id: 'tiny-2', text: 't2' },
        ],
      },
    ],
  };
  const answers = [ans('tiny', 'tiny-1', 'yes', 't1'), ans('tiny', 'tiny-2', 'no', 't2')];
  const { branchLines } = gardenVerdict(tiny, answers);
  ok(
    'complete small branch → count-only line, no "just started", no majority word',
    branchLines[0].line === 'On small, you said 1 yes and 1 no.' &&
      !branchLines[0].line.includes('started') &&
      !branchLines[0].line.includes('mostly')
  );
}

// ── Case: reflected covers coverage but is excluded from yes/no counts ──
{
  // yeslean: 3 yes + 2 reflected → answered 5/5, n=3, 100% yes → yes-lean "3 out of 3"
  const answers = [
    ans('fix', 'fix-yes-1', 'yes', 'y1'),
    ans('fix', 'fix-yes-2', 'yes', 'y2'),
    ans('fix', 'fix-yes-3', 'yes', 'y3'),
    ans('fix', 'fix-yes-4', 'reflected', 'y4'),
    ans('fix', 'fix-yes-5', 'reflected', 'y5'),
  ];
  const { branchLines } = gardenVerdict(rooted, answers);
  const yl = branchLines.find((b) => b.key === 'yeslean');
  ok(
    "reflected counts toward coverage but not yes/no tally",
    yl && yl.line === "On letting in, you said yes 3 times out of 3 — you've mostly been saying yes to this."
  );
}

// ── Case: legacy answers matched by normalized text (no slug, diff case/space) ──
{
  const legacyGarden = {
    id: 'leg',
    name: 'legacy',
    root: null,
    branches: [
      {
        key: 'opening',
        name: 'the questions',
        items: [
          { id: 'leg-1', text: 'Does it taste like soap?' },
          { id: 'leg-2', text: 'Is the sky blue?' },
          { id: 'leg-3', text: 'Do you sleep well?' },
        ],
      },
    ],
  };
  const answers = [
    // no questionSlug; text differs by case + whitespace
    { gardenId: 'leg', answer: 'yes', text: '  DOES it   taste like SOAP? ' },
    { gardenId: 'leg', answer: 'yes', text: 'is the sky BLUE?' },
    { gardenId: 'leg', answer: 'yes', text: 'DO you sleep   well?' },
  ];
  const { branchLines } = gardenVerdict(legacyGarden, answers);
  ok(
    'legacy no-slug answers matched by normalized text',
    branchLines.length === 1 &&
      branchLines[0].line === "On the questions, you said yes 3 times out of 3 — you've mostly been saying yes to this."
  );
}

// ── Case: preRootLine null while any branch incomplete ──
{
  const { preRootLine, closingLine } = gardenVerdict(rooted, baseAnswers);
  // untouched branch has an unanswered item → root not unlocked
  ok('preRootLine null while a branch is incomplete', preRootLine === null);
  ok('closingLine null while root unanswered', closingLine === null);
}

// ── Case: preRootLine non-null when all covered & root unanswered ──
{
  const answers = [
    ...baseAnswers,
    ans('fix', 'fix-un-1', 'yes', 'u1'), // finish the untouched branch
  ];
  const { preRootLine, closingLine } = gardenVerdict(rooted, answers);
  // total branch items = 5+4+4+0+1 = 14
  ok(
    'preRootLine non-null when all covered, root unanswered',
    preRootLine === "You've answered all 14 questions. Here's where you've been landing — then the garden asks its real question."
  );
  ok('closingLine still null before root answered', closingLine === null);
}

// Helper: all branches covered, plus a root answer.
const allCovered = (rootAnswer) => [
  ...baseAnswers,
  ans('fix', 'fix-un-1', 'yes', 'u1'),
  ans('fix', 'fix-root', rootAnswer, 'The straight question?'),
];

// Pooled across branches with baseAnswers + untouched-yes:
//   yes = 4 + 1 + 2 + 1 = 8 ; no = 1 + 3 + 2 + 0 = 6 ; n = 14 → 57% yes (no strong lean → split closing)

// ── Case: closing — split (no strict pooled lean) ──
{
  const { preRootLine, closingLine } = gardenVerdict(rooted, allCovered('yes'));
  ok('preRootLine null once root answered', preRootLine === null);
  ok(
    'closing split case (no >=65% pooled lean)',
    closingLine === 'Your 14 answers never settled on a side (8 yes, 6 no) — but asked straight, you said yes.'
  );
}

// For aligned/crossed we need a strong pooled lean. Build a clean strong-yes garden.
const strongYes = {
  id: 'sy',
  name: 'strong yes',
  root: { id: 'sy-root', text: 'root?', vibe: 'decision', difficulty: 3 },
  branches: [
    {
      key: 'b',
      name: 'branch',
      items: [
        { id: 'sy-1', text: 'a' },
        { id: 'sy-2', text: 'b' },
        { id: 'sy-3', text: 'c' },
        { id: 'sy-4', text: 'd' },
      ],
    },
  ],
};
// 4 yes, 0 no → 100% yes pooled lean
const strongYesAnswers = (rootAnswer) => [
  ans('sy', 'sy-1', 'yes', 'a'),
  ans('sy', 'sy-2', 'yes', 'b'),
  ans('sy', 'sy-3', 'yes', 'c'),
  ans('sy', 'sy-4', 'yes', 'd'),
  ans('sy', 'sy-root', rootAnswer, 'root?'),
];

// ── Case: closing — aligned (root matches strong pooled lean) ──
{
  const { closingLine } = gardenVerdict(strongYes, strongYesAnswers('yes'));
  ok(
    'closing aligned case',
    closingLine === 'You said yes — and your 4 small answers had mostly landed there too (4 yes, 0 no).'
  );
}

// ── Case: closing — crossed (root no, pooled lean >=65% yes) ──
{
  const { closingLine } = gardenVerdict(strongYes, strongYesAnswers('no'));
  ok(
    'closing crossed case (root opposes strong lean)',
    closingLine === 'Your small answers leaned yes (4 yes, 0 no) — but asked straight, you said no. Worth sitting with.'
  );
}

// ── Case: rootless garden → preRootLine and closingLine always null ──
{
  const rootless = {
    id: 'rl',
    name: 'rootless',
    root: null,
    branches: [
      {
        key: 'opening',
        name: 'the questions',
        items: [
          { id: 'rl-1', text: 'q1' },
          { id: 'rl-2', text: 'q2' },
          { id: 'rl-3', text: 'q3' },
        ],
      },
    ],
  };
  const answers = [
    ans('rl', 'rl-1', 'yes', 'q1'),
    ans('rl', 'rl-2', 'yes', 'q2'),
    ans('rl', 'rl-3', 'yes', 'q3'),
  ];
  const { branchLines, preRootLine, closingLine } = gardenVerdict(rootless, answers);
  ok(
    'rootless garden still produces branchLines',
    branchLines.length === 1 && branchLines[0].key === 'opening'
  );
  ok('rootless garden: preRootLine always null', preRootLine === null);
  ok('rootless garden: closingLine always null', closingLine === null);
}

// ── Case: determinism — two calls produce identical output ──
{
  const a = gardenVerdict(rooted, allCovered('yes'));
  const b = gardenVerdict(rooted, allCovered('yes'));
  ok('determinism: identical output across calls', JSON.stringify(a) === JSON.stringify(b));
}

// ── Invariant: "mostly" (any majority word) appears ONLY on a strict majority ──
{
  // Sweep several answer shapes; whenever a line contains "most", assert a
  // strict yes/no majority is literally present in that line's counts.
  const cases = [
    [rooted, baseAnswers],
    [rooted, allCovered('yes')],
    [rooted, allCovered('no')],
    [strongYes, strongYesAnswers('no')],
  ];
  let checked = 0;
  let violations = 0;
  const majorityWord = /\bmost(ly)?\b/i;
  for (const [g, aa] of cases) {
    const v = gardenVerdict(g, aa);
    const allLines = [
      ...v.branchLines.map((b) => b.line),
      v.preRootLine,
      v.closingLine,
    ].filter(Boolean);
    for (const line of allLines) {
      if (!majorityWord.test(line)) continue;
      checked++;
      // Parse "yes Y times out of N" or "no M times out of N" to verify majority.
      const mYes = line.match(/you said yes (\d+) times out of (\d+)/);
      const mNo = line.match(/you said no (\d+) times out of (\d+)/);
      if (mYes) {
        const y = +mYes[1];
        const n = +mYes[2];
        if (!(y > n - y)) violations++; // yes strict majority of n
      } else if (mNo) {
        const no = +mNo[1];
        const n = +mNo[2];
        if (!(no > n - no)) violations++;
      } else {
        violations++; // "mostly" with no verifiable count is a violation
      }
    }
  }
  ok(`"mostly" only on strict majority (${checked} majority lines checked)`, checked > 0 && violations === 0);
}

if (failures) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log('\nAll garden-verdict tests passed.');
