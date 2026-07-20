#!/usr/bin/env node
// Cilantro — garden-question BAKE step.
//
//   node scripts/bake-garden-questions.mjs            # bake
//   node scripts/bake-garden-questions.mjs --dry-run  # report only, writes nothing
//   node scripts/bake-garden-questions.mjs --exclude ai-daily-3,ai-fear-7   # veto ids
//
// Takes the owner-approved garden drafts (scripts/output/garden-ai-drafts.json)
// and bakes them into two hand-editable data modules:
//
//   src/data/gardens/ai.json   — each draft appended to its branch's items AFTER
//                                the seeds, field order {id, contentType, text,
//                                vibe, difficulty}.
//   src/data/questionMeta.js   — one text-keyed { tags, gardens: [] } entry per
//                                draft, so topicsOf / fine-print lookups see
//                                garden questions (same shape as bank entries).
//
// Veto: pass `--exclude id,id,...` to drop specific draft ids from the bake
// (mirrors bake-fine-print.mjs's skip conventions; the drafts JSON has no
// strike-through marks, so exclusion is by id).
//
// Idempotent: a draft whose id is already in its branch is skipped, and a draft
// whose text is already a key in questionMeta is skipped — re-running after a
// successful bake adds nothing and leaves both files byte-identical.
//
// Refuses to run if any draft names a `branch` that does not exist in the garden
// file (structural mismatch — fix the drafts or the garden first).
//
// Constraints honoured: does not touch scripts/output/*, does not commit, and
// modifies only the two files above. No new dependencies. NEVER runs as a side
// effect of anything — it is invoked by hand.

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { questionMeta } from '../src/data/questionMeta.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRAFTS_JSON = join(ROOT, 'scripts', 'output', 'garden-ai-drafts.json');
const GARDEN_JSON = join(ROOT, 'src', 'data', 'gardens', 'ai.json');
const QUESTION_META_JS = join(ROOT, 'src', 'data', 'questionMeta.js');

const BAKE_DATE = 'Jul 19, 2026';
const SECTION_MARKER = `  // ── Garden AI drafts baked (${BAKE_DATE}) ──`;

// ── Flags ──
const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const excludeArg = argv[argv.indexOf('--exclude') + 1];
const EXCLUDE = new Set(
  argv.includes('--exclude') && excludeArg && !excludeArg.startsWith('--')
    ? excludeArg.split(',').map((s) => s.trim()).filter(Boolean)
    : []
);

// ── Serialisation: single-quoted JS string literals matching questionMeta.js ──
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

// ── Insert a block of new entries just before questionMeta.js's object close ──
// (same splice trick as bake-fine-print.mjs).
function spliceEntries(source, filePath, anchor, headerNeedle, headerLine, entriesBlock) {
  let out = source;
  if (!out.includes(headerLine)) {
    if (!out.includes(headerNeedle)) {
      throw new Error(`Could not find header anchor in ${filePath}`);
    }
    out = out.replace(headerNeedle, `${headerLine}\n${headerNeedle}`);
  }
  const closeMarker = `\n};\n\n${anchor}`;
  const idx = out.indexOf(closeMarker);
  if (idx === -1) {
    throw new Error(`Could not find object close (\\n};\\n\\n${anchor}) in ${filePath}`);
  }
  const before = out.slice(0, idx);
  const after = out.slice(idx);
  return `${before}\n${entriesBlock}${after}`;
}

function main() {
  const drafts = JSON.parse(readFileSync(DRAFTS_JSON, 'utf8'));
  const garden = JSON.parse(readFileSync(GARDEN_JSON, 'utf8'));
  const all = Object.values(drafts.questions || {});

  const branchByKey = new Map((garden.branches || []).map((b) => [b.key, b]));

  // ── Guard: every draft's branch must exist in the garden file. ──
  const badBranch = all.filter((e) => !branchByKey.has(e.branch));
  if (badBranch.length) {
    console.error('REFUSING TO BAKE — drafts reference branches absent from the garden file:');
    for (const e of badBranch) console.error(`  · ${e.id} → branch "${e.branch}"`);
    console.error(`Garden branches: ${[...branchByKey.keys()].join(', ')}`);
    process.exit(1);
  }

  const counts = {
    excluded: 0,
    addedItems: 0,
    skippedExistingItems: 0,
    addedMeta: 0,
    skippedExistingMeta: 0,
  };
  const perBranch = new Map(
    (garden.branches || []).map((b) => [
      b.key,
      { name: b.name, seeds: b.items.length, added: 0, skipped: 0 },
    ])
  );

  const newMeta = []; // { text, tags } in garden/branch order

  for (const e of all) {
    if (EXCLUDE.has(e.id)) {
      counts.excluded++;
      continue;
    }
    const branch = branchByKey.get(e.branch);

    // 1) gardens/ai.json — append after seeds, skip if id already present.
    if (branch.items.some((it) => it.id === e.id)) {
      counts.skippedExistingItems++;
      perBranch.get(e.branch).skipped++;
    } else {
      branch.items.push({
        id: e.id,
        contentType: 'question',
        text: e.text,
        vibe: e.vibe,
        difficulty: e.difficulty,
      });
      counts.addedItems++;
      perBranch.get(e.branch).added++;
    }

    // 2) questionMeta.js — text-keyed, never overwrite an existing key.
    if (e.text in questionMeta) {
      counts.skippedExistingMeta++;
    } else {
      newMeta.push({ text: e.text, tags: Array.isArray(e.tags) ? e.tags : [] });
    }
  }
  counts.addedMeta = newMeta.length;

  // ── Write gardens/ai.json (full re-serialise; seeds stay byte-identical) ──
  if (!DRY_RUN && counts.addedItems > 0) {
    writeFileSync(GARDEN_JSON, JSON.stringify(garden, null, 2) + '\n');
  }

  // ── Write questionMeta.js ──
  if (!DRY_RUN && newMeta.length) {
    const src = readFileSync(QUESTION_META_JS, 'utf8');
    const block = [
      SECTION_MARKER,
      ...newMeta.map(
        (e) => `  ${q(e.text)}:\n    { tags: [${e.tags.map(q).join(', ')}], gardens: [] },`
      ),
    ].join('\n') + '\n';
    const headerLine =
      `// Garden bake ${BAKE_DATE}: entries below the "Garden AI drafts baked" marker were added by scripts/bake-garden-questions.mjs.`;
    const next = spliceEntries(
      src,
      QUESTION_META_JS,
      'const EMPTY = { tags: [], gardens: [] };',
      'export const questionMeta = {',
      headerLine,
      block
    );
    writeFileSync(QUESTION_META_JS, next);
  }

  // ── Summary ──
  const seedTotal = [...perBranch.values()].reduce((s, b) => s + b.seeds, 0);
  console.log('');
  console.log('══════════════════════════════════════════════════════');
  console.log(` GARDEN BAKE SUMMARY${DRY_RUN ? '  (dry run — nothing written)' : ''}`);
  console.log('══════════════════════════════════════════════════════');
  console.log(`  garden                   : ${garden.id}`);
  console.log(`  drafts read              : ${all.length}`);
  console.log(`  seeds (already in garden): ${seedTotal}`);
  console.log('  per-branch (seeds + drafts):');
  for (const [key, b] of perBranch) {
    const total = b.seeds + b.added + b.skipped;
    console.log(
      `    ${key.padEnd(8)} "${b.name}" — ${b.seeds} seed(s) + ${b.added} draft(s)` +
        `${b.skipped ? ` (+${b.skipped} already present)` : ''} = ${total}`
    );
  }
  console.log('──────────────────────────────────────────────────────');
  console.log(`  items added to ai.json      : ${counts.addedItems}`);
  console.log(`  items skipped (already in)  : ${counts.skippedExistingItems}`);
  console.log(`  meta added to questionMeta  : ${counts.addedMeta}`);
  console.log(`  meta skipped (already in)   : ${counts.skippedExistingMeta}`);
  console.log(`  excluded (--exclude)        : ${counts.excluded}`);
  console.log('──────────────────────────────────────────────────────');
  console.log(`  ai.json         : ${statSync(GARDEN_JSON).size} bytes`);
  console.log(`  questionMeta.js : ${statSync(QUESTION_META_JS).size} bytes`);
  if (DRY_RUN) {
    console.log('  (dry run — ai.json and questionMeta.js left untouched)');
  } else if (!counts.addedItems && !newMeta.length) {
    console.log('  (no new entries — files left untouched; bake is idempotent)');
  }
  console.log('══════════════════════════════════════════════════════');
}

main();
