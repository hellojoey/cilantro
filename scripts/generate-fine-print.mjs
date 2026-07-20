#!/usr/bin/env node
// Cilantro — fine-print batch generator.
//
//   node --env-file=.env.local scripts/generate-fine-print.mjs [flags]
//
// Drafts fine print for uncovered questions in bulk, triage-first so cost stays
// controlled. It NEVER writes to src/data — it produces review artifacts under
// scripts/output/ for Joey to look at, edit, and later bake in by hand.
//
// The pipeline mirrors api/fine-print.js and REUSES its _lib helpers verbatim
// (createJSON, research, filterToRealSources, ModelOutputError). The prime
// directive is inherited unchanged: fine print informs the answer, it never
// argues for one; and sources are real or they do not exist (enforced in code
// by filterToRealSources against the URLs web search actually returned).
//
// ─── Cost control (a hard requirement) ────────────────────────────────────────
//   1. Triage  — ONE cheap createJSON call classifies the whole batch:
//                none | clarifier | sourced.  'sourced' is meant to be RARE.
//   2. Clarifiers — cheap batched createJSON (~10 questions/call): one-line
//                clarifier + 2-4 tags each.
//   3. Sourced — expensive, one at a time: research() (web search) → structuring
//                createJSON → filterToRealSources.  Only genuinely contested
//                factual/societal questions reach here.
//
// Flags:
//   --pilot N        pick N uncovered questions, deterministic, spanning all 8
//                    categories, deliberately weighted toward contested-flavored
//                    ones (society / media / health / belief).
//   --slugs a,b,c    target explicit question ids instead (still skips covered
//                    unless --force).
//   --seed S         PRNG seed for --pilot selection (default 1337).
//   --force          reprocess even if already covered or already drafted.
//   --dry-run        print the selection + planned calls and exit. No API calls.
//   --help
//
// ─── Garden mode ──────────────────────────────────────────────────────────────
//   --gardens [ids]  index garden questions from src/data/gardens/*.json instead
//                    of the 2,000-question bank. Value is a comma list of garden
//                    ids (ai,goat,afterlife,gaza) or "all" (bare --gardens == all).
//                    Indexes the root question plus every branch item whose
//                    contentType is "question"; item ids (ai-root, ai-seed-04…)
//                    are the stable slugs, question text is the fine-print key —
//                    exactly like the bank. With no --slugs/--pilot, garden mode
//                    processes ALL indexed garden questions. Garden runs are
//                    contested-topic questions, so the 'sourced' tier is EXPECTED
//                    to fire often (nothing caps it). Garden drafts get their own
//                    resume files so a garden run never touches the bank's:
//                      scripts/output/fine-print-garden-drafts.json
//                      scripts/output/FINE_PRINT_GARDEN_DRAFTS.md
//
// Robustness: ModelOutputError and SDK errors are caught per batch/question,
// recorded in the JSON under `error`, and the run continues. The drafts JSON is
// the resume state — rerun and it skips slugs already done (errored entries are
// retried; use --force to redo everything).

import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { questionCategories } from '../src/data/questions.js';
import { getFinePrint } from '../src/data/finePrint.js';
import { getQuestionMeta } from '../src/data/questionMeta.js';
import {
  MODEL,
  ModelOutputError,
  createJSON,
  filterToRealSources,
  research,
} from '../api/_lib/anthropic.js';

// ─────────────────────────────────────────────────────────────────────────────
// Paths + constants
// ─────────────────────────────────────────────────────────────────────────────
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'scripts', 'output');
const GARDENS_DIR = join(ROOT, 'src', 'data', 'gardens');
// Bank-run defaults. Garden mode reassigns these (below) so a garden run keeps
// its own resume state and never clobbers the bank's drafts.
let DRAFTS_JSON = join(OUT_DIR, 'fine-print-drafts.json');
let DRAFTS_MD = join(OUT_DIR, 'FINE_PRINT_DRAFTS.md');

// Opus 4.8 token pricing. Web-search server-tool fees are NOT modelled here.
const PRICE = { input: 5 / 1e6, output: 25 / 1e6 };
const TOTAL_BANK = 1800; // uncovered universe we extrapolate toward

// Category slugs that skew genuinely contested — society, media, health, belief.
const CONTESTED_SLUGS = new Set(['social', 'pop', 'wellness', 'deep']);

const CLARIFIER_BATCH_SIZE = 10;
// Triage must be chunked too: a single call over the full 1,800-question bank
// would blow past max_tokens and kill the run at step one.
const TRIAGE_BATCH_SIZE = 50;
const DEFAULT_SEED = 1337;

// ─────────────────────────────────────────────────────────────────────────────
// Prompts — voice lifted from api/fine-print.js so the batch reads identically.
// PRIME DIRECTIVE: fine print informs the answer, it never argues for one.
// ─────────────────────────────────────────────────────────────────────────────
const TRIAGE_SYSTEM = `You are triaging yes/no questions from Cilantro, a reflection app, deciding how much fine print each one needs. Fine print informs the answer; it never argues for one.

Classify each question into exactly one tier:

- "none": the question is self-evident and personal. It asks about the reader's own
  inner life, memory, taste, mood, body, or imagination. There is no term to define
  and no external literature that informs it. MOST questions are "none". A clarifier
  that clarifies nothing is noise.

- "clarifier": answering well depends on what a word means, or on the scope/timeframe/
  rule of the question — but no outside sources are involved. A single neutral line
  would let the reader answer a well-formed question instead of guessing at your intent.

- "sourced": RARE. Only genuinely contested matters of fact — society, media, health,
  science, belief — where informed people disagree and a reader is better off having
  seen the real spread of views. If it is about the reader's own life, it is NOT sourced.
  Do not reach for this tier to seem thorough; most societal-sounding questions are still
  personal at heart.

Never moralise, never hint at an answer. Return one classification per question, using
the exact slug given.`;

const CLARIFIER_SYSTEM = `You are writing fine print for yes/no questions in Cilantro, a reflection app.

FINE PRINT'S PRIME DIRECTIVE: it informs the answer. It never argues for one. If a
reader can tell which way you lean, you have failed.

For each question, write:

clarifier — ONE line: the neutral clarifier. It defines an ambiguous term, or fixes the
scope / timeframe / rule, so the reader answers a well-formed question instead of guessing
at what you meant. House voice, e.g.:
  · "Peace here means calm and settled — it doesn't have to mean happy."
  · "\\"Recently\\" means the past week or so — and listening means you noticed and acted on it."
  · "Any size counts, from a small slip to something you've carried for years."
Never hint at an answer, never add encouragement, never moralise. Vague timeframes
("recently", "lately") and vague quantities ("too much", "enough") usually deserve a line;
a genuinely self-evident question deserves an empty string. Return "" freely — a clarifier
that clarifies nothing is noise.

tags — 2 to 4 lowercase topic hashtags, no "#", hyphenate multiword (e.g. "self-growth").
Tags are required for EVERY question, including ones whose clarifier is "".

Return one entry per question, using the exact slug given.`;

const RESEARCH_SYSTEM = `You are researching one yes/no question from Cilantro, a reflection app, to gather REAL sources for its fine print.

This question has already been judged genuinely contested — a matter of fact where informed
people disagree. Use web search to find real, readable, reputable sources that together
represent the honest spread of views. Not a balanced-sounding pair — the actual distribution.
If the evidence largely points one way, say so and do not manufacture a false counterweight.

For each source, report its title, publisher, exact URL, and the perspective it brings. Then
note anything a reader should understand about the terms of the question.

Never cite from memory. Only report a source you actually retrieved via search. If search
returns nothing usable, say so plainly.`;

const STRUCTURE_SYSTEM = `You are writing the fine print for one genuinely contested question in Cilantro, a yes/no reflection app.

FINE PRINT'S PRIME DIRECTIVE: it informs the answer. It never argues for one. If a reader
can tell which way you lean, you have failed.

clarifier — one neutral line defining a term or fixing scope, or "" if self-evident.

notes — one or two short paragraphs of factual, attributable, neutral background, or "".
Only where real background exists and genuinely helps. Same directive: inform, never steer.

tags — 2 to 4 lowercase topic hashtags, no "#", hyphenate multiword.

sources — ONLY from the verified URL list you are given. You may not cite anything else: any
URL outside that list will be discarded, so inventing one accomplishes nothing. Copy each URL
exactly. For each, "perspective" is one short neutral line on the view that source brings. If
the list is empty, return an empty array — that is the correct, expected answer.`;

// ─────────────────────────────────────────────────────────────────────────────
// Schemas (json_schema top level must be an object → array results are wrapped)
// ─────────────────────────────────────────────────────────────────────────────
const TRIAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['classifications'],
  properties: {
    classifications: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['slug', 'needs', 'reason'],
        properties: {
          slug: { type: 'string' },
          needs: { type: 'string', enum: ['none', 'clarifier', 'sourced'] },
          reason: { type: 'string', description: 'One short line justifying the tier.' },
        },
      },
    },
  },
};

const CLARIFIER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['entries'],
  properties: {
    entries: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['slug', 'clarifier', 'tags'],
        properties: {
          slug: { type: 'string' },
          clarifier: { type: 'string', description: 'One neutral clarifier line, or "".' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

const STRUCTURE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['clarifier', 'notes', 'tags', 'sources'],
  properties: {
    clarifier: { type: 'string' },
    notes: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'publisher', 'url', 'perspective'],
        properties: {
          title: { type: 'string' },
          publisher: { type: 'string' },
          url: { type: 'string', description: 'Must be copied exactly from the verified URL list.' },
          perspective: { type: 'string' },
        },
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Small utilities
// ─────────────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { pilot: null, slugs: null, seed: DEFAULT_SEED, force: false, dryRun: false, help: false, gardens: null };
  const splitList = (s) => String(s ?? '').split(',').map((x) => x.trim()).filter(Boolean);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--force') args.force = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--pilot') args.pilot = parseInt(argv[++i], 10);
    else if (a === '--seed') args.seed = parseInt(argv[++i], 10);
    else if (a === '--slugs') args.slugs = splitList(argv[++i]);
    else if (a === '--gardens') {
      // Optional value: `--gardens ai,goat` or bare `--gardens` (== all).
      const nxt = argv[i + 1];
      if (nxt && !nxt.startsWith('--')) { args.gardens = splitList(nxt); i++; }
      else args.gardens = ['all'];
    }
    else if (a.startsWith('--pilot=')) args.pilot = parseInt(a.slice(8), 10);
    else if (a.startsWith('--seed=')) args.seed = parseInt(a.slice(7), 10);
    else if (a.startsWith('--slugs=')) args.slugs = splitList(a.slice(8));
    else if (a.startsWith('--gardens=')) args.gardens = splitList(a.slice(10));
    else console.warn(`(ignoring unknown flag: ${a})`);
  }
  return args;
}

// mulberry32 — tiny deterministic PRNG so a given --seed always picks the same set.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(list, rand) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const normUsage = (u) => ({ input: u?.input_tokens ?? u?.input ?? 0, output: u?.output_tokens ?? u?.output ?? 0 });
const addUsage = (a, b) => ({ input: a.input + b.input, output: a.output + b.output });
const scaleUsage = (u, f) => ({ input: Math.round(u.input * f), output: Math.round(u.output * f) });
const costOf = (u) => u.input * PRICE.input + u.output * PRICE.output;
const fmt$ = (n) => `$${n.toFixed(2)}`;
const ts = () => new Date().toISOString().slice(11, 19);
const log = (...a) => console.log(`[${ts()}]`, ...a);

// ─────────────────────────────────────────────────────────────────────────────
// Build the question index (id → {text, vibe, category, categorySlug, covered})
// ─────────────────────────────────────────────────────────────────────────────
function buildIndex() {
  const byId = new Map();
  const byCatSlug = new Map(); // categorySlug → [entry,...]
  for (const cat of questionCategories) {
    const catSlug = cat.slug;
    const catName = cat.category;
    for (const q of cat.questions) {
      const covered = getFinePrint(q.text) !== null || (getQuestionMeta(q.text).tags || []).length > 0;
      const entry = { slug: q.id, text: q.text, vibe: q.vibe, category: catName, categorySlug: catSlug, covered };
      byId.set(q.id, entry);
      if (!byCatSlug.has(catSlug)) byCatSlug.set(catSlug, []);
      byCatSlug.get(catSlug).push(entry);
    }
  }
  return { byId, byCatSlug };
}

// ─────────────────────────────────────────────────────────────────────────────
// Garden index — same entry shape as the bank, sourced from src/data/gardens/*.
// categorySlug = garden id, category = garden name; slug = item id; the question
// text is the fine-print key exactly like the bank. Indexes the root question
// plus every branch item whose contentType is "question". `covered` uses the
// same finePrint/questionMeta check, so a garden question that already has fine
// print (keyed by identical text) skips just like a covered bank question.
// ─────────────────────────────────────────────────────────────────────────────
function resolveGardenIds(requested) {
  const available = readdirSync(GARDENS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -5))
    .sort();
  if (!requested || requested.includes('all')) return available;
  const known = [];
  for (const id of requested) {
    if (available.includes(id)) known.push(id);
    else console.warn(`(no garden "${id}" in src/data/gardens — skipping)`);
  }
  return known;
}

function buildGardenIndex(gardenIds) {
  const byId = new Map();
  const byCatSlug = new Map();
  const allInOrder = [];
  for (const gid of gardenIds) {
    const garden = JSON.parse(readFileSync(join(GARDENS_DIR, `${gid}.json`), 'utf8'));
    const catSlug = garden.id;
    const catName = garden.name;
    const items = [];
    if (garden.root && garden.root.text) items.push(garden.root); // the root question
    for (const branch of garden.branches ?? []) {
      for (const it of branch.items ?? []) {
        if (it.contentType === 'question') items.push(it);
      }
    }
    for (const q of items) {
      // Garden coverage = having FINE PRINT only. (The bank also counts tags,
      // because its tags are written by this pipeline — but garden tags arrive
      // with the question BAKE, so tags here say nothing about fine print and
      // counting them would silently skip every baked garden question.)
      const covered = getFinePrint(q.text) !== null;
      const entry = { slug: q.id, text: q.text, vibe: q.vibe, category: catName, categorySlug: catSlug, covered };
      byId.set(q.id, entry);
      if (!byCatSlug.has(catSlug)) byCatSlug.set(catSlug, []);
      byCatSlug.get(catSlug).push(entry);
      allInOrder.push(entry);
    }
  }
  return { byId, byCatSlug, allInOrder };
}

// Deterministic pilot selection: N uncovered questions spanning all categories,
// weighting the leftover toward contested-flavored categories.
function selectPilot(index, n, seed) {
  const rand = mulberry32(seed);
  // Shuffle uncovered pool per category (deterministic given seed).
  const pools = new Map();
  for (const [catSlug, entries] of index.byCatSlug) {
    const uncovered = entries.filter((e) => !e.covered);
    pools.set(catSlug, shuffled(uncovered, rand));
  }

  // Order categories: contested first (so they lead each round-robin round),
  // then the rest — both alphabetised for determinism.
  const cats = [...pools.keys()].sort();
  const contested = cats.filter((c) => CONTESTED_SLUGS.has(c));
  const others = cats.filter((c) => !CONTESTED_SLUGS.has(c));
  const order = [...contested, ...others];

  const ptr = new Map(order.map((c) => [c, 0]));
  const picked = [];
  let madeProgress = true;
  while (picked.length < n && madeProgress) {
    madeProgress = false;
    for (const c of order) {
      if (picked.length >= n) break;
      const pool = pools.get(c) || [];
      const i = ptr.get(c);
      if (i < pool.length) {
        picked.push(pool[i]);
        ptr.set(c, i + 1);
        madeProgress = true;
      }
    }
  }
  return picked;
}

// ─────────────────────────────────────────────────────────────────────────────
// Drafts state (resume): keyed by slug. An entry with an `error` is retried.
// ─────────────────────────────────────────────────────────────────────────────
function loadDrafts() {
  if (!existsSync(DRAFTS_JSON)) return {};
  try {
    return JSON.parse(readFileSync(DRAFTS_JSON, 'utf8'));
  } catch (e) {
    console.warn(`Could not parse existing drafts (${e.message}); starting fresh.`);
    return {};
  }
}

function saveDrafts(drafts) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(DRAFTS_JSON, JSON.stringify(drafts, null, 2) + '\n');
}

const TIER_LABEL = { sourced: 'Sourced', clarifier: 'Clarifier', none: 'None (self-evident / personal)' };
const TIER_ORDER = ['sourced', 'clarifier', 'none'];

function writeMarkdown(drafts) {
  const entries = Object.values(drafts);
  const counts = { none: 0, clarifier: 0, sourced: 0, error: 0 };
  let cum = { input: 0, output: 0 };
  for (const e of entries) {
    if (e.error) counts.error++;
    if (e.needs && counts[e.needs] !== undefined) counts[e.needs]++;
    cum = addUsage(cum, normUsage(e.usage));
  }

  const lines = [];
  lines.push('# Fine Print — Batch Drafts (for review)');
  lines.push('');
  lines.push(`_Regenerated ${new Date().toISOString()} · model ${MODEL} · NOT yet baked into src/data._`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total drafted: **${entries.length}**`);
  lines.push(`- Sourced: **${counts.sourced}** · Clarifier: **${counts.clarifier}** · None: **${counts.none}**` +
    (counts.error ? ` · Errors: **${counts.error}**` : ''));
  lines.push(`- Cumulative tokens: ${cum.input.toLocaleString()} in / ${cum.output.toLocaleString()} out`);
  lines.push(`- Estimated cost so far: **${fmt$(costOf(cum))}** _(token cost only; web-search fees not included)_`);
  lines.push('');

  for (const tier of TIER_ORDER) {
    const group = entries.filter((e) => e.needs === tier);
    if (!group.length) continue;
    lines.push(`## ${TIER_LABEL[tier]} — ${group.length}`);
    lines.push('');
    group.sort((a, b) => a.slug.localeCompare(b.slug));
    for (const e of group) {
      lines.push(`### \`${e.slug}\` · ${e.category}`);
      lines.push('');
      lines.push(`> ${e.text}`);
      lines.push('');
      lines.push(`*vibe: ${e.vibe}*${e.error ? `  ·  ⚠ **error:** ${e.error}` : ''}`);
      lines.push('');
      if (e.clarifier) {
        lines.push(`**Clarifier:** ${e.clarifier}`);
        lines.push('');
      }
      if (e.notes) {
        lines.push(`**Notes:** ${e.notes}`);
        lines.push('');
      }
      if (e.tags && e.tags.length) {
        lines.push(`**Tags:** ${e.tags.map((t) => `#${t}`).join(' ')}`);
        lines.push('');
      }
      if (e.sources && e.sources.length) {
        lines.push(`**Sources** (${e.sources.length}${e.sourcesDropped ? `, ${e.sourcesDropped} dropped as unverified` : ''}):`);
        for (const s of e.sources) {
          lines.push(`- [${s.title || s.url}](${s.url}) — *${s.publisher}* — ${s.perspective}`);
        }
        lines.push('');
      } else if (tier === 'sourced') {
        lines.push(`_No verified sources${e.sourcesDropped ? ` (${e.sourcesDropped} dropped as unverified)` : ' — web search returned nothing usable'}._`);
        lines.push('');
      }
      lines.push('---');
      lines.push('');
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(DRAFTS_MD, lines.join('\n'));
}

function normalizeTags(raw) {
  return [...new Set((raw ?? [])
    .map((t) => String(t).toLowerCase().replace(/^#/, '').trim().replace(/\s+/g, '-'))
    .filter(Boolean))].slice(0, 4);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); return; }

  // ── Universe: the bank (default) or gardens (--gardens). ──
  const gardenMode = Array.isArray(args.gardens);
  let index;
  if (gardenMode) {
    const gardenIds = resolveGardenIds(args.gardens);
    if (!gardenIds.length) {
      console.error('No gardens to index. Pass --gardens all or --gardens ai,goat. See --help.');
      process.exitCode = 1;
      return;
    }
    index = buildGardenIndex(gardenIds);
    // Garden runs resume from — and write review markdown to — their own files.
    DRAFTS_JSON = join(OUT_DIR, 'fine-print-garden-drafts.json');
    DRAFTS_MD = join(OUT_DIR, 'FINE_PRINT_GARDEN_DRAFTS.md');
    log(`Garden mode: ${gardenIds.join(', ')} — indexed ${index.byId.size} question(s) (root + contentType:"question" items).`);
  } else {
    index = buildIndex();
  }

  // ── Selection ──
  let selection;
  if (args.slugs && args.slugs.length) {
    selection = [];
    for (const s of args.slugs) {
      const e = index.byId.get(s);
      if (!e) { console.warn(`(no question with id "${s}" — skipping)`); continue; }
      selection = selection.concat(e);
    }
  } else if (Number.isInteger(args.pilot) && args.pilot > 0) {
    selection = selectPilot(index, args.pilot, args.seed);
  } else if (gardenMode) {
    // Default in garden mode: process every indexed garden question, in file order.
    selection = index.allInOrder;
  } else {
    console.error('Nothing to do. Pass --pilot N or --slugs a,b,c. See --help.');
    process.exitCode = 1;
    return;
  }

  const drafts = loadDrafts();

  // Skip already-covered (in src/data) and already-drafted-without-error, unless --force.
  const isDone = (slug) => {
    const d = drafts[slug];
    return d && !d.error;
  };
  const planned = [];
  const skipped = [];
  for (const e of selection) {
    if (!args.force && e.covered) { skipped.push({ ...e, why: 'already covered in src/data' }); continue; }
    if (!args.force && isDone(e.slug)) { skipped.push({ ...e, why: 'already drafted' }); continue; }
    planned.push(e);
  }

  // ── Report the plan ──
  const byCat = {};
  for (const e of planned) byCat[e.categorySlug] = (byCat[e.categorySlug] || 0) + 1;
  const contestedCount = planned.filter((e) => CONTESTED_SLUGS.has(e.categorySlug)).length;

  log(`Selection: ${selection.length} requested · ${planned.length} to process · ${skipped.length} skipped`);
  log(`Categories in batch: ${Object.entries(byCat).map(([c, n]) => `${c}:${n}`).join(', ') || '(none)'}`);
  log(`Contested-flavored in batch: ${contestedCount}`);
  if (skipped.length) {
    for (const s of skipped) log(`  skip ${s.slug} — ${s.why}`);
  }

  if (args.dryRun) {
    console.log('\n── DRY RUN — planned calls (no API calls made) ──');
    console.log(`  1× triage call     → classify ${planned.length} question(s)`);
    console.log(`  ~${Math.ceil(planned.length / CLARIFIER_BATCH_SIZE)}× clarifier call(s) → (for whichever come back "clarifier", ${CLARIFIER_BATCH_SIZE}/call)`);
    console.log(`  ≤${planned.length}× sourced pipeline(s) → research()+structure (only for "sourced"; expected RARE)`);
    console.log('\nPlanned questions:');
    for (const e of planned) console.log(`  ${e.slug}  [${e.categorySlug}]  ${e.text}`);
    if (!planned.length) console.log('  (nothing — all selected questions were skipped)');
    return;
  }

  if (!planned.length) {
    log('Nothing to process. Regenerating markdown from existing drafts and exiting.');
    writeMarkdown(drafts);
    return;
  }

  // Per-run token tallies for the cost report.
  const runUsage = {
    triage: { input: 0, output: 0 },
    clarifier: { input: 0, output: 0 },
    sourced: { input: 0, output: 0 },
  };

  // ── 1. Triage (chunked — its only gate is the expensive `sourced` path) ──
  const tierBySlug = new Map();
  let triageShare = { input: 0, output: 0 };
  const triageChunks = Math.ceil(planned.length / TRIAGE_BATCH_SIZE);
  for (let i = 0; i < planned.length; i += TRIAGE_BATCH_SIZE) {
    const chunk = planned.slice(i, i + TRIAGE_BATCH_SIZE);
    const chunkNo = Math.floor(i / TRIAGE_BATCH_SIZE) + 1;
    try {
      log(`Triage: chunk ${chunkNo}/${triageChunks} — classifying ${chunk.length} question(s)…`);
      const triagePrompt = [
        'Classify each of these yes/no questions into: none, clarifier, or sourced.',
        'Remember: MOST are "none". "sourced" is rare.',
        '',
        ...chunk.map((e) => `- slug: ${e.slug} | category: ${e.category} | vibe: ${e.vibe}\n  "${e.text}"`),
      ].join('\n');

      const { parsed, usage } = await createJSON({
        system: TRIAGE_SYSTEM,
        prompt: triagePrompt,
        schema: TRIAGE_SCHEMA,
        effort: 'low',
      });
      runUsage.triage = addUsage(runUsage.triage, normUsage(usage));
      for (const c of parsed.classifications ?? []) {
        if (index.byId.has(c.slug)) tierBySlug.set(c.slug, { needs: c.needs, reason: c.reason });
      }
    } catch (err) {
      const msg = err instanceof ModelOutputError ? err.message : (err?.message ?? String(err));
      // Triage's only decision is sourced-vs-not, so a failed chunk safely
      // defaults its questions to the writer path rather than killing the run.
      log(`  triage chunk ${chunkNo} FAILED: ${msg} — defaulting its questions to the writer path.`);
    }
    // Default anything unclassified (model forgot it, or its chunk failed).
    for (const e of chunk) {
      if (!tierBySlug.has(e.slug)) tierBySlug.set(e.slug, { needs: 'clarifier', reason: '(unclassified; defaulted to writer)' });
    }
  }
  triageShare = scaleUsage(runUsage.triage, 1 / planned.length);
  {
    const tc = { none: 0, clarifier: 0, sourced: 0 };
    for (const e of planned) tc[tierBySlug.get(e.slug).needs]++;
    log(`Triage done: none=${tc.none} clarifier=${tc.clarifier} sourced=${tc.sourced}  (${runUsage.triage.input}/${runUsage.triage.output} tok)`);
  }

  // Seed drafts for every planned question with its tier now (resumable).
  // Everything seeds as pending: if the process dies before a question's
  // generation step, resume retries it instead of skipping a seeded entry
  // that never got its content.
  for (const e of planned) {
    const t = tierBySlug.get(e.slug);
    drafts[e.slug] = draftBase(e, {
      needs: t.needs,
      needsReason: t.reason,
      usage: { input: 0, output: 0 },
      error: 'pending (generation not yet run)',
    });
  }
  saveDrafts(drafts);

  // Triage's only gate is `sourced` (the expensive path). Everything else goes
  // through the writer, which returns clarifier: "" when a question truly needs
  // nothing — the writer decides, Joey vetoes. Tags are generated for every
  // question regardless: Profile's topic filters and the planned topic graphs
  // run on them. (A stricter triage-as-gatekeeper shipped ~0% coverage —
  // pilot finding, Jul 14.)
  const clarifierQ = planned.filter((e) => tierBySlug.get(e.slug).needs !== 'sourced');
  const sourcedQ = planned.filter((e) => tierBySlug.get(e.slug).needs === 'sourced');

  // ── 2. Clarifiers (batched, ~10/call) ──
  for (let i = 0; i < clarifierQ.length; i += CLARIFIER_BATCH_SIZE) {
    const batch = clarifierQ.slice(i, i + CLARIFIER_BATCH_SIZE);
    const batchNo = Math.floor(i / CLARIFIER_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(clarifierQ.length / CLARIFIER_BATCH_SIZE);
    log(`Clarifiers: batch ${batchNo}/${totalBatches} (${batch.length} question(s))…`);
    try {
      const prompt = [
        'Write fine print for each of these yes/no questions. One clarifier line + 2-4 tags each.',
        '',
        ...batch.map((e) => `- slug: ${e.slug} | vibe: ${e.vibe}\n  "${e.text}"`),
      ].join('\n');
      const { parsed, usage } = await createJSON({
        system: CLARIFIER_SYSTEM,
        prompt,
        schema: CLARIFIER_SCHEMA,
        effort: 'medium',
      });
      runUsage.clarifier = addUsage(runUsage.clarifier, normUsage(usage));
      const share = scaleUsage(normUsage(usage), 1 / batch.length);

      const bySlug = new Map((parsed.entries ?? []).map((x) => [x.slug, x]));
      for (const e of batch) {
        const out = bySlug.get(e.slug);
        const entryUsage = addUsage(triageShare, share);
        if (!out) {
          drafts[e.slug] = { ...drafts[e.slug], usage: entryUsage, error: 'missing from clarifier batch response' };
          continue;
        }
        drafts[e.slug] = {
          ...drafts[e.slug],
          clarifier: String(out.clarifier ?? '').trim(),
          tags: normalizeTags(out.tags),
          usage: entryUsage,
          error: null,
        };
      }
    } catch (err) {
      const msg = err instanceof ModelOutputError ? err.message : (err?.message ?? String(err));
      log(`  clarifier batch ${batchNo} FAILED: ${msg}`);
      for (const e of batch) {
        drafts[e.slug] = { ...drafts[e.slug], usage: triageShare, error: `clarifier failed: ${msg}` };
      }
    }
    saveDrafts(drafts);
    writeMarkdown(drafts);
  }

  // ── 3. Sourced (one at a time: research → structure → filter) ──
  for (let i = 0; i < sourcedQ.length; i++) {
    const e = sourcedQ[i];
    log(`Sourced ${i + 1}/${sourcedQ.length}: ${e.slug} — researching…`);
    try {
      const researched = await research({
        system: RESEARCH_SYSTEM,
        prompt: `Question: "${e.text}"${e.vibe ? `\nVibe: ${e.vibe}` : ''}\n\nResearch it: find the real spread of reputable sources.`,
        effort: 'xhigh',
        maxUses: 8,
      });
      const verifiedUrls = researched.searchResults;

      const urlList = verifiedUrls.length
        ? verifiedUrls.map((r) => `- ${r.url}${r.title ? `  (${r.title})` : ''}`).join('\n')
        : '(empty — web search returned nothing usable, so sources MUST be an empty array)';

      log(`  structuring (${verifiedUrls.length} verified URL(s) found)…`);
      const { parsed, usage: structUsage } = await createJSON({
        system: STRUCTURE_SYSTEM,
        prompt: [
          `Question: "${e.text}"`,
          e.vibe ? `Vibe: ${e.vibe}` : null,
          '',
          'Research notes:',
          researched.text || '(no notes)',
          '',
          'VERIFIED URL LIST — the only URLs you may cite:',
          urlList,
          '',
          'Write the fine print.',
        ].filter((l) => l !== null).join('\n'),
        schema: STRUCTURE_SCHEMA,
        effort: 'high',
      });

      // Enforce the prime directive: drop anything not backed by a real result.
      const { sources, dropped } = filterToRealSources(parsed.sources, verifiedUrls);
      if (dropped.length) log(`  dropped ${dropped.length} unverified source(s).`);

      const entryUsage = addUsage(addUsage(triageShare, normUsage(researched.usage)), normUsage(structUsage));
      runUsage.sourced = addUsage(runUsage.sourced, addUsage(normUsage(researched.usage), normUsage(structUsage)));

      drafts[e.slug] = {
        ...drafts[e.slug],
        clarifier: String(parsed.clarifier ?? '').trim(),
        notes: String(parsed.notes ?? '').trim(),
        tags: normalizeTags(parsed.tags),
        sources,
        sourcesDropped: dropped.length,
        verifiedUrlsFound: verifiedUrls.length,
        usage: entryUsage,
        error: null,
      };
      log(`  ${e.slug} done: ${sources.length} source(s) kept.`);
    } catch (err) {
      const msg = err instanceof ModelOutputError ? err.message : (err?.message ?? String(err));
      log(`  sourced ${e.slug} FAILED: ${msg}`);
      drafts[e.slug] = { ...drafts[e.slug], usage: triageShare, error: `sourced failed: ${msg}` };
    }
    saveDrafts(drafts);
    writeMarkdown(drafts);
  }

  // ── Final cost report ──
  saveDrafts(drafts);
  writeMarkdown(drafts);
  printCostReport({
    planned, tierBySlug, runUsage, clarifierQ, sourcedQ,
    ...(gardenMode ? { projTarget: index.byId.size, projNoun: 'all indexed garden questions' } : {}),
  });
}

function draftBase(e, extra) {
  return {
    slug: e.slug,
    text: e.text,
    vibe: e.vibe,
    category: e.category,
    needs: null,
    clarifier: '',
    notes: '',
    tags: [],
    sources: [],
    sourcesDropped: 0,
    usage: { input: 0, output: 0 },
    error: null,
    ...extra,
  };
}

function printCostReport({ planned, tierBySlug, runUsage, clarifierQ, sourcedQ, projTarget = TOTAL_BANK, projNoun = 'the full uncovered bank' }) {
  const noneCount = planned.filter((e) => tierBySlug.get(e.slug)?.needs === 'none').length;
  const total = addUsage(addUsage(runUsage.triage, runUsage.clarifier), runUsage.sourced);
  const line = (label, u) => `  ${label.padEnd(12)} ${String(u.input).padStart(9)} in  ${String(u.output).padStart(9)} out   ${fmt$(costOf(u))}`;

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(' COST REPORT (this run)');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`  Processed: ${planned.length}  (none=${noneCount}, clarifier=${clarifierQ.length}, sourced=${sourcedQ.length})`);
  console.log('  Tier              input     output       cost');
  console.log(line('triage', runUsage.triage));
  console.log(line('clarifier', runUsage.clarifier));
  console.log(line('sourced', runUsage.sourced));
  console.log('  ─────────────────────────────────────────────────');
  console.log(line('TOTAL', total));
  console.log('  (token cost only — server-side web-search fees not included)');

  if (planned.length) {
    const totalCost = costOf(total);
    const perQ = totalCost / planned.length;
    const ratio = {
      none: noneCount / planned.length,
      clarifier: clarifierQ.length / planned.length,
      sourced: sourcedQ.length / planned.length,
    };
    const flat = perQ * projTarget;
    console.log('\n  ── Extrapolation to ' + projNoun + ' (~' + projTarget + ') ──');
    console.log(`  Observed tier mix: none ${(ratio.none * 100).toFixed(0)}% · clarifier ${(ratio.clarifier * 100).toFixed(0)}% · sourced ${(ratio.sourced * 100).toFixed(0)}%`);
    console.log(`  Avg cost/question: ${fmt$(perQ)}`);
    console.log(`  Naive projection : ${fmt$(flat)} for ${projTarget} questions`);
    if (sourcedQ.length) {
      const perSourced = costOf(runUsage.sourced) / sourcedQ.length;
      console.log(`  (Sourced questions average ${fmt$(perSourced)} each — the dominant cost driver; watch the sourced %.)`);
    }
  }
  console.log(`\n  Drafts JSON : ${DRAFTS_JSON}`);
  console.log(`  Review MD   : ${DRAFTS_MD}`);
  console.log('══════════════════════════════════════════════════════════════\n');
}

function printHelp() {
  console.log(`Cilantro fine-print batch generator

  node --env-file=.env.local scripts/generate-fine-print.mjs [flags]

Flags:
  --pilot N        Pick N uncovered questions deterministically, spanning all 8
                   categories, weighted toward contested-flavored ones.
  --slugs a,b,c    Target explicit question ids instead.
  --seed S         PRNG seed for --pilot (default ${DEFAULT_SEED}).
  --force          Reprocess even if already covered or already drafted.
  --dry-run        Print selection + planned calls and exit (no API calls).
  --gardens [ids]  Index garden questions (src/data/gardens/*.json) instead of
                   the bank. Value = comma list of garden ids or "all" (bare
                   --gardens == all). Roots + contentType:"question" items; item
                   ids are the slugs. No --slugs/--pilot ⇒ ALL garden questions.
                   Contested by nature, so the 'sourced' tier fires often.
  --help

Outputs (git-ignored):
  scripts/output/fine-print-drafts.json          bank: machine-usable + resume state
  scripts/output/FINE_PRINT_DRAFTS.md            bank: Joey's review surface
  scripts/output/fine-print-garden-drafts.json   --gardens: resume state
  scripts/output/FINE_PRINT_GARDEN_DRAFTS.md     --gardens: Joey's review surface

Never writes to src/data. Rerun to resume; errored entries are retried.
--gardens uses separate output files, so a garden run never touches bank drafts.`);
}

main().catch((err) => {
  console.error('Fatal:', err?.stack ?? err?.message ?? err);
  process.exitCode = 1;
});
