#!/usr/bin/env node
// Cilantro — garden deep-bank question generator (pilot: the AI garden).
//
//   node --env-file=.env.local scripts/generate-garden-questions.mjs [flags]
//
// A garden is a ROOT question earned by BRANCHES of easy yes/no questions.
// This script generates a garden's branch content as DRAFTS for Joey's review —
// nothing ships, nothing bakes, nothing touches src/data or api/. It only writes
// review artifacts under scripts/output/.
//
// It mirrors scripts/generate-fine-print.mjs: resumable drafts JSON as the resume
// state, markdown regenerated after every chunk, an Opus cost report, and
// per-chunk error resilience (a failed chunk is recorded and the run continues).
//
// The pilot hardcodes the AI garden, but GARDEN and its branches are a plain
// config block — the next garden is a config addition, not a code change.
//
// ─── House bar (enforced by prompt + code post-filter) ────────────────────────
//   Yes/no answerable, one clause (two max), plain lowercase-friendly voice.
//   LOCATE the reader's position, never argue a side, never embed a stat/premise.
//   Personal beats abstract. Mix registers; difficulty 1-3 (3 = the stingers).
//   Vibe from vibe-dimensions.json only. Tags 2-4, always include "ai".
//   No dupes/near-dupes vs the bank, the garden's existing questions, or the batch.
//
// Flags:
//   --dry-run     print the plan (branches, targets, existing counts) and exit.
//   --branch KEY  restrict this run to one branch (repeatable via comma list).
//   --force       ignore existing drafts and regenerate the whole garden fresh.
//   --help
//
// Robustness: SDK / ModelOutputError failures are caught per chunk, recorded in
// the drafts JSON under `errors`, and the run continues. Rerun to resume — any
// branch still under target is topped up (which naturally retries failed chunks).

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { questions as bankQuestions, gardens, vibeToDimensions } from '../src/data/questions.js';
import { MODEL, ModelOutputError, createJSON } from '../api/_lib/anthropic.js';

// ─────────────────────────────────────────────────────────────────────────────
// Config — the AI garden. Add a garden by adding a block like this one.
// ─────────────────────────────────────────────────────────────────────────────
const GARDEN = {
  id: 'ai',
  root: 'Do you want the world AI is building?',
  branches: [
    { key: 'daily',  target: 18, brief: 'where AI already lives in your day — assistants, feeds, autocomplete, maps, search, the small automatic conveniences you barely notice anymore.' },
    { key: 'work',   target: 18, brief: 'your craft and your job — what you would hand over, what you would keep, what still has to be yours, how it changes the value of what you do.' },
    { key: 'art',    target: 18, brief: 'creation, authenticity, and taste — whether the source changes how a thing feels, what counts as yours, what art is for when a machine can make it.' },
    { key: 'truth',  target: 18, brief: 'trust and reality — deepfakes, knowing what is real, who and what you believe, whether you can still tell.' },
    { key: 'people', target: 18, brief: 'relationships and care — companionship, loneliness, kids, dating, friendship, and what a machine should never be allowed to do for us.' },
    { key: 'power',  target: 18, brief: 'control and stakes — who owns it, who benefits, who decides, whether you have any say in the world it makes.' },
    { key: 'fear',   target: 18, brief: 'danger, loss, and speed — the thing you are actually afraid of, what you might lose, whether it is moving too fast.' },
    { key: 'hope',   target: 18, brief: 'the best case — what it could give, what you would genuinely want from it, the future with AI you would actually choose.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Paths + constants
// ─────────────────────────────────────────────────────────────────────────────
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'scripts', 'output');
const DRAFTS_JSON = join(OUT_DIR, 'garden-ai-drafts.json');
const DRAFTS_MD = join(OUT_DIR, 'GARDEN_AI_DRAFTS.md');

// Opus 4.8 token pricing (token cost only — matches the fine-print script).
const PRICE = { input: 5 / 1e6, output: 25 / 1e6 };

const CHUNK_SIZE = 10;      // questions requested per createJSON call
const MAX_TAGS = 4;
const VALID_VIBES = new Set(Object.keys(vibeToDimensions));

// Per branch, allow a few extra chunks beyond the naive minimum so dropped
// dupes don't starve the target — but cap it so a branch that keeps colliding
// can't loop forever. Overshoot-then-trim (Joey vetoes down) is the intent.
const extraChunkBudget = (target) => Math.ceil(target / CHUNK_SIZE) + 4;

// ─────────────────────────────────────────────────────────────────────────────
// Prompts — voice lifted from the live AI garden so drafts read identically.
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM = `You write yes/no questions for Cilantro, a reflection app. Its promise: easy questions help you answer hard ones. You are filling out ONE garden — a deep bank of questions that circle a single contested topic until the reader has genuinely located themselves on it.

THE HOUSE BAR (every question must clear all of it):

1. Yes/no answerable. One clause preferred, two clauses maximum. Plain, lowercase-friendly voice — the way a sharp friend actually talks, not a survey.

2. LOCATE, never argue. A question must not embed a stance, a statistic, or a premise the reader has to accept before answering. "Given AI's dangers, would you..." is BANNED. Read every candidate both ways: a devoted AI optimist AND a hard AI skeptic should each feel the question is fair to them and answerable without conceding anything. If either would say "that question isn't fair," it fails.

3. Personal beats abstract, always. "Would you let AI write your wedding toast?" beats "Is AI appropriate for ceremonial writing?" Put the reader, their life, their people, their hands in the question. Concrete objects and moments over categories and abstractions.

4. Mix registers within the branch. MOST questions are mundane and concrete (small, specific, everyday). A few are reflective. One or two sting a little — they name the thing the reader would rather not answer. Match difficulty to register: 1 = light/easy, 2 = makes you actually think, 3 = the stinger you feel.

5. No duplicates or near-duplicates. Do not restate, rephrase, or gently reword any question in the provided lists (the garden's existing questions, everything already generated this run, or any question a reader would recognize as "the same question again"). Every question must open a genuinely new angle on the branch.

Return ONLY the questions, nothing else.`;

function buildUserPrompt({ branch, count, anchors, avoidList }) {
  return [
    `GARDEN: AI — "Tool or trash, helper or hazard: where do you actually stand?"`,
    `ROOT QUESTION (the hard one all of this is building toward, do NOT restate it): "${GARDEN.root}"`,
    ``,
    `BRANCH: "${branch.key}" — ${branch.brief}`,
    ``,
    `Write ${count} NEW yes/no questions for this branch. Stay inside the branch's territory. Vary the register per the house bar (mostly mundane/concrete, a few reflective, one or two that sting). Spread difficulty across 1, 2, and 3 — do not make everything a 3.`,
    ``,
    `For each question provide:`,
    `- text: the question. Yes/no answerable, one clause preferred.`,
    `- vibe: ONE value from this exact list (no others): ${[...VALID_VIBES].join(', ')}.`,
    `- difficulty: integer 1, 2, or 3.`,
    `- tags: 2 to 4 lowercase topic words, no "#". ALWAYS include "ai" plus branch-specific topics (e.g. "${branch.key}", and concrete nouns from the question).`,
    ``,
    `VOICE ANCHORS — match this register and bar (these are already in the garden; do NOT reuse or reword them):`,
    ...anchors.map((t) => `  · ${t}`),
    ``,
    `DO NOT restate, reword, or near-duplicate any of these already-existing questions:`,
    ...avoidList.map((t) => `  · ${t}`),
  ].join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema (json_schema top level must be an object → the array is wrapped)
// ─────────────────────────────────────────────────────────────────────────────
const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['text', 'vibe', 'difficulty', 'tags'],
        properties: {
          text: { type: 'string', description: 'The yes/no question.' },
          vibe: { type: 'string', enum: [...VALID_VIBES] },
          difficulty: { type: 'integer', description: '1 (light), 2 (makes you think), or 3 (the stinger).' },
          tags: { type: 'array', items: { type: 'string' }, description: '2-4 lowercase topic words, always including "ai".' },
        },
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Small utilities
// ─────────────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { dryRun: false, force: false, help: false, branches: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--force') args.force = true;
    else if (a === '--branch') args.branches = String(argv[++i] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (a.startsWith('--branch=')) args.branches = a.slice(9).split(',').map((s) => s.trim()).filter(Boolean);
    else console.warn(`(ignoring unknown flag: ${a})`);
  }
  return args;
}

const normUsage = (u) => ({ input: u?.input_tokens ?? u?.input ?? 0, output: u?.output_tokens ?? u?.output ?? 0 });
const addUsage = (a, b) => ({ input: a.input + b.input, output: a.output + b.output });
const costOf = (u) => u.input * PRICE.input + u.output * PRICE.output;
const fmt$ = (n) => `$${n.toFixed(2)}`;
const ts = () => new Date().toISOString().slice(11, 19);
const log = (...a) => console.log(`[${ts()}]`, ...a);

// Canonical form for dedupe: lowercase, letters+digits+spaces only, collapsed.
function normText(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTags(raw) {
  const cleaned = (raw ?? [])
    .map((t) => String(t).toLowerCase().replace(/^#/, '').trim().replace(/\s+/g, '-'))
    .filter(Boolean);
  const set = [...new Set(cleaned)];
  // Force-include "ai" (prepend so it survives the max-tags trim).
  if (!set.includes('ai')) set.unshift('ai');
  else { set.splice(set.indexOf('ai'), 1); set.unshift('ai'); }
  return set.slice(0, MAX_TAGS);
}

// ─────────────────────────────────────────────────────────────────────────────
// Drafts state (resume). Shape:
//   { meta, questions: { "ai-<branch>-<n>": {...} }, errors: [...], run: {...} }
// ─────────────────────────────────────────────────────────────────────────────
function emptyState() {
  return {
    meta: { gardenId: GARDEN.id, root: GARDEN.root, model: MODEL, updatedAt: null },
    questions: {},
    errors: [],
  };
}

function loadState() {
  if (!existsSync(DRAFTS_JSON)) return emptyState();
  try {
    const parsed = JSON.parse(readFileSync(DRAFTS_JSON, 'utf8'));
    return { ...emptyState(), ...parsed };
  } catch (e) {
    console.warn(`Could not parse existing drafts (${e.message}); starting fresh.`);
    return emptyState();
  }
}

function saveState(state) {
  mkdirSync(OUT_DIR, { recursive: true });
  state.meta.updatedAt = new Date().toISOString();
  writeFileSync(DRAFTS_JSON, JSON.stringify(state, null, 2) + '\n');
}

const branchEntries = (state, key) =>
  Object.values(state.questions).filter((q) => q.branch === key);

// Next free numeric suffix for a branch (monotonic across runs).
function nextIndex(state, key) {
  let max = 0;
  for (const id of Object.keys(state.questions)) {
    const m = id.match(new RegExp(`^${GARDEN.id}-${key}-(\\d+)$`));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Markdown review surface — grouped by branch, with a summary + cost header.
// ─────────────────────────────────────────────────────────────────────────────
function writeMarkdown(state) {
  const all = Object.values(state.questions);
  let cum = { input: 0, output: 0 };
  for (const q of all) cum = addUsage(cum, normUsage(q.usage));

  const lines = [];
  lines.push(`# Garden deep-bank drafts — ${GARDEN.id.toUpperCase()} (for review)`);
  lines.push('');
  lines.push(`_Regenerated ${new Date().toISOString()} · model ${MODEL} · DRAFTS ONLY — not baked into src/data._`);
  lines.push('');
  lines.push(`**ROOT question** (asked last, after the branches are covered): _${GARDEN.root}_`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total generated: **${all.length}** across ${GARDEN.branches.length} branches`);
  lines.push('');
  lines.push('| Branch | Generated | Target |');
  lines.push('| --- | --- | --- |');
  for (const b of GARDEN.branches) {
    lines.push(`| ${b.key} | ${branchEntries(state, b.key).length} | ${b.target} |`);
  }
  lines.push('');
  lines.push(`- Cumulative tokens: ${cum.input.toLocaleString()} in / ${cum.output.toLocaleString()} out`);
  lines.push(`- Estimated cost so far: **${fmt$(costOf(cum))}** _(token cost only)_`);
  if (state.errors?.length) {
    lines.push(`- Errored chunks (recorded, retried on rerun): **${state.errors.length}**`);
  }
  lines.push('');

  for (const b of GARDEN.branches) {
    const group = branchEntries(state, b.key).sort((a, z) => a.id.localeCompare(z.id, undefined, { numeric: true }));
    lines.push(`## Branch: \`${b.key}\` — ${group.length}/${b.target}`);
    lines.push('');
    lines.push(`_${b.brief}_`);
    lines.push('');
    if (!group.length) { lines.push('_(none yet)_'); lines.push(''); continue; }
    for (const q of group) {
      lines.push(`- **${q.text}**`);
      lines.push(`  · vibe: \`${q.vibe}\` · difficulty: ${q.difficulty} · tags: ${q.tags.map((t) => `#${t}`).join(' ')}`);
    }
    lines.push('');
  }

  if (state.errors?.length) {
    lines.push('## Errored chunks');
    lines.push('');
    for (const e of state.errors) lines.push(`- \`${e.branch}\` @ ${e.at}: ${e.message}`);
    lines.push('');
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(DRAFTS_MD, lines.join('\n'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); return; }

  // The garden's already-live questions: seed content + voice anchors + dedupe.
  const garden = gardens.find((g) => g.id === GARDEN.id);
  if (!garden) { console.error(`No live garden with id "${GARDEN.id}".`); process.exitCode = 1; return; }
  const existingGardenTexts = (garden.items || [])
    .filter((it) => it.contentType === 'question' && it.text)
    .map((it) => it.text);

  // Dedupe universe: 2,000-question bank (normalized) + garden's own questions.
  const bankNorm = new Set(bankQuestions.map((q) => normText(q.text)));
  const seenNorm = new Set([...existingGardenTexts.map(normText)]);

  const branchesToRun = args.branches
    ? GARDEN.branches.filter((b) => args.branches.includes(b.key))
    : GARDEN.branches;
  if (args.branches && branchesToRun.length !== args.branches.length) {
    const known = new Set(GARDEN.branches.map((b) => b.key));
    for (const k of args.branches) if (!known.has(k)) console.warn(`(no branch "${k}" — skipping)`);
  }

  let state = args.force ? emptyState() : loadState();
  // Fold already-drafted texts (from a prior run) into the dedupe set.
  for (const q of Object.values(state.questions)) seenNorm.add(normText(q.text));

  // ── Report the plan ──
  log(`Garden "${GARDEN.id}" · ${branchesToRun.length} branch(es) this run · ${existingGardenTexts.length} live garden questions (seed/anchors)`);
  log(`Dedupe universe: ${bankNorm.size} bank + ${existingGardenTexts.length} garden + drafts-so-far`);
  for (const b of branchesToRun) {
    const have = args.force ? 0 : branchEntries(state, b.key).length;
    log(`  branch ${b.key.padEnd(7)} target ${String(b.target).padStart(2)} · already have ${have}`);
  }

  if (args.dryRun) {
    console.log('\n── DRY RUN — plan (no API calls made) ──');
    let totalNeeded = 0;
    for (const b of branchesToRun) {
      const have = args.force ? 0 : branchEntries(state, b.key).length;
      const need = Math.max(0, b.target - have);
      totalNeeded += need;
      const chunks = need ? Math.ceil(need / CHUNK_SIZE) : 0;
      console.log(`  ${b.key.padEnd(7)} need ${String(need).padStart(2)} more → ~${chunks} chunk(s) of up to ${CHUNK_SIZE} (up to ${extraChunkBudget(b.target)} attempts if dupes drop)`);
    }
    console.log(`\n  Total to generate this run: ~${totalNeeded} question(s) toward ${branchesToRun.reduce((s, b) => s + b.target, 0)} target across ${branchesToRun.length} branch(es).`);
    console.log(`  Voice anchors: ${existingGardenTexts.length} live AI-garden questions.`);
    console.log(`  Effort: medium · chunk size: ${CHUNK_SIZE} · model: ${MODEL}`);
    console.log(`\n  Outputs (git-ignored):`);
    console.log(`    ${DRAFTS_JSON}`);
    console.log(`    ${DRAFTS_MD}`);
    return;
  }

  const runUsage = { input: 0, output: 0 };
  let generatedThisRun = 0;
  let droppedDupe = 0;
  let droppedInvalid = 0;

  // ── Generate per branch ──
  for (const branch of branchesToRun) {
    let have = branchEntries(state, branch.key).length;
    let attempts = 0;
    const maxAttempts = extraChunkBudget(branch.target);

    while (have < branch.target && attempts < maxAttempts) {
      attempts++;
      const want = Math.min(CHUNK_SIZE, branch.target - have);
      log(`Branch ${branch.key}: chunk ${attempts} — requesting ${want} (have ${have}/${branch.target})…`);

      // Avoid list: garden questions + everything generated so far this run
      // (across all branches). Cap to keep the prompt lean but representative.
      const avoidTexts = [
        ...existingGardenTexts,
        ...Object.values(state.questions).map((q) => q.text),
      ];
      // De-dup the display list and cap at a generous but bounded size.
      const avoidDisplay = [...new Set(avoidTexts)].slice(-140);

      try {
        const { parsed, usage } = await createJSON({
          system: SYSTEM,
          prompt: buildUserPrompt({
            branch,
            count: want,
            anchors: existingGardenTexts,
            avoidList: avoidDisplay,
          }),
          schema: SCHEMA,
          effort: 'medium',
        });
        runUsage.input += normUsage(usage).input;
        runUsage.output += normUsage(usage).output;

        const candidates = parsed.questions ?? [];
        // Per-question share of this chunk's usage, for the cost report + md.
        const share = {
          input: Math.round(normUsage(usage).input / Math.max(1, candidates.length)),
          output: Math.round(normUsage(usage).output / Math.max(1, candidates.length)),
        };

        let keptThisChunk = 0;
        for (const c of candidates) {
          const text = String(c.text ?? '').trim();
          if (!text) { droppedInvalid++; continue; }
          const nt = normText(text);

          // Dedupe: vs bank, vs garden + all drafts + this-run batch.
          if (bankNorm.has(nt) || seenNorm.has(nt)) { droppedDupe++; continue; }

          // Vibe must be in the enum.
          const vibe = String(c.vibe ?? '').trim();
          if (!VALID_VIBES.has(vibe)) { droppedInvalid++; continue; }

          // Clamp difficulty to 1-3 integer.
          let difficulty = Math.round(Number(c.difficulty));
          if (!Number.isFinite(difficulty)) difficulty = 2;
          difficulty = Math.min(3, Math.max(1, difficulty));

          const tags = normalizeTags(c.tags);

          const idx = nextIndex(state, branch.key);
          const id = `${GARDEN.id}-${branch.key}-${idx}`;
          state.questions[id] = {
            id,
            branch: branch.key,
            text,
            vibe,
            difficulty,
            tags,
            usage: share,
          };
          seenNorm.add(nt);
          have++;
          keptThisChunk++;
          generatedThisRun++;
          if (have >= branch.target) break;
        }
        log(`  kept ${keptThisChunk} / ${candidates.length} (branch now ${have}/${branch.target})`);
      } catch (err) {
        const msg = err instanceof ModelOutputError ? err.message : (err?.message ?? String(err));
        log(`  chunk FAILED: ${msg} — recorded; continuing.`);
        state.errors.push({ branch: branch.key, message: msg, at: new Date().toISOString() });
      }

      // Resume state + review surface refreshed after every chunk.
      saveState(state);
      writeMarkdown(state);
    }

    if (have < branch.target) {
      log(`Branch ${branch.key}: stopped at ${have}/${branch.target} after ${attempts} attempt(s) (dupes/attempt cap).`);
    } else {
      log(`Branch ${branch.key}: done — ${have}/${branch.target}.`);
    }
  }

  // Prune any stale error entries for branches that are now at/over target,
  // so a clean rerun doesn't keep reporting resolved failures.
  state.errors = (state.errors || []).filter((e) => {
    const b = GARDEN.branches.find((x) => x.key === e.branch);
    return b && branchEntries(state, e.branch).length < b.target;
  });

  saveState(state);
  writeMarkdown(state);
  printCostReport({ state, runUsage, generatedThisRun, droppedDupe, droppedInvalid, branchesToRun });
}

function printCostReport({ state, runUsage, generatedThisRun, droppedDupe, droppedInvalid, branchesToRun }) {
  const line = (label, u) => `  ${label.padEnd(14)} ${String(u.input).padStart(9)} in  ${String(u.output).padStart(9)} out   ${fmt$(costOf(u))}`;
  let cum = { input: 0, output: 0 };
  for (const q of Object.values(state.questions)) cum = addUsage(cum, normUsage(q.usage));

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(` COST REPORT — garden "${GARDEN.id}" (this run)`);
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  Generated this run: ${generatedThisRun}   ·   dropped: ${droppedDupe} dupe, ${droppedInvalid} invalid`);
  console.log('  Scope             input     output       cost');
  console.log(line('this run', runUsage));
  console.log(line('all drafts', cum));
  console.log('\n  Per-branch generated (total drafts):');
  for (const b of GARDEN.branches) {
    console.log(`    ${b.key.padEnd(8)} ${String(branchEntries(state, b.key).length).padStart(2)} / ${b.target}`);
  }
  const totalDrafts = Object.keys(state.questions).length;
  if (generatedThisRun) {
    console.log(`\n  Avg cost/question this run: ${fmt$(costOf(runUsage) / generatedThisRun)}`);
  }
  console.log(`  Total drafts in file: ${totalDrafts}`);
  if (state.errors?.length) console.log(`  Errored chunks (retry on rerun): ${state.errors.length}`);
  console.log(`\n  Drafts JSON : ${DRAFTS_JSON}`);
  console.log(`  Review MD   : ${DRAFTS_MD}`);
  console.log('══════════════════════════════════════════════════════════════\n');
}

function printHelp() {
  console.log(`Cilantro garden deep-bank generator (pilot: the AI garden)

  node --env-file=.env.local scripts/generate-garden-questions.mjs [flags]

Flags:
  --dry-run       Print the plan (branches, targets, existing counts) and exit.
  --branch KEY    Restrict to one branch (comma list for several).
  --force         Ignore existing drafts and regenerate the whole garden fresh.
  --help

Outputs (git-ignored, drafts only — never writes src/data or api/):
  scripts/output/garden-ai-drafts.json   machine-usable + resume state
  scripts/output/GARDEN_AI_DRAFTS.md      Joey's review surface

Rerun to resume: any branch under target is topped up, which retries failures.`);
}

main().catch((err) => {
  console.error('Fatal:', err?.stack ?? err?.message ?? err);
  process.exitCode = 1;
});
