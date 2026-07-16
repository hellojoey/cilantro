#!/usr/bin/env node
// Cilantro — fine-print BAKE step.
//
//   node scripts/bake-fine-print.mjs
//
// Takes the owner-approved batch drafts (scripts/output/fine-print-drafts.json)
// and bakes them into the two hand-editable, exact-text-keyed data modules:
//
//   src/data/finePrint.js     — one entry per draft with a NON-EMPTY clarifier.
//   src/data/questionMeta.js  — one entry per draft (ALL of them), { tags, gardens: [] }.
//
// It NEVER overwrites existing curated content: any draft whose exact text is
// already a key in the target map is skipped. Entries with a non-null `error`
// are skipped. Every draft text is validated against the live question bank
// (questions.js) — an exact-text mismatch is warned and skipped. New entries are
// sorted by slug (category then number) so the diff is stable and reviewable.
//
// Idempotent: re-running after a successful bake adds nothing (all texts are now
// keys → all skipped → both files left untouched).
//
// Sourced entries carry notes + sources, but there is no UI slot for those yet,
// so they are NOT baked — the script prints a reminder listing their slugs.
//
// Constraints honoured: does not touch scripts/output/*, does not commit, and
// modifies only the two data files above. No new dependencies.

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { questionCategories } from '../src/data/questions.js';
import { finePrint } from '../src/data/finePrint.js';
import { questionMeta } from '../src/data/questionMeta.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRAFTS_JSON = join(ROOT, 'scripts', 'output', 'fine-print-drafts.json');
const FINE_PRINT_JS = join(ROOT, 'src', 'data', 'finePrint.js');
const QUESTION_META_JS = join(ROOT, 'src', 'data', 'questionMeta.js');

const BAKE_DATE = 'Jul 15, 2026';
const SECTION_MARKER = `  // ── Baked from batch run (${BAKE_DATE}) ──`;

// ── Serialisation: single-quoted JS string literals matching the files' style ──
// Escape backslashes, then single quotes. Double quotes are left raw (the files
// carry "Recently" etc. unescaped inside single quotes).
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

// ── Slug sort: category prefix (alpha) then zero-padded number ──
function slugKey(slug) {
  const m = /^([a-z]+)-(\d+)$/.exec(slug);
  if (!m) return [slug, -1];
  return [m[1], parseInt(m[2], 10)];
}
function bySlug(a, b) {
  const [pa, na] = slugKey(a.slug);
  const [pb, nb] = slugKey(b.slug);
  if (pa !== pb) return pa < pb ? -1 : 1;
  return na - nb;
}

// ── Insert a block of new entries just before a target file's object-closing `};` ──
// `anchor` is the text that immediately follows the object's `};` (e.g. the getter
// export). We splice the new entries in between the last existing entry and `};`.
function spliceEntries(source, filePath, anchor, headerNeedle, headerLine, entriesBlock) {
  // Header note (added once; splice is only ever called when there are new entries).
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
  // Insert the block after the last entry's trailing newline, before `};`.
  const before = out.slice(0, idx); // ends with the last entry's trailing comma
  const after = out.slice(idx);     // starts with "\n};\n\n<anchor>"
  return `${before}\n${entriesBlock}${after}`;
}

function main() {
  const drafts = JSON.parse(readFileSync(DRAFTS_JSON, 'utf8'));
  const all = Object.values(drafts);

  // Valid question-bank texts (exact match required).
  const bankTexts = new Set();
  for (const cat of questionCategories) {
    for (const question of cat.questions) bankTexts.add(question.text);
  }

  const counts = {
    skippedError: 0,
    skippedUnmatched: 0,
    skippedExistingFP: 0,
    skippedExistingMeta: 0,
    addedFP: 0,
    addedMeta: 0,
  };
  const sourcedReminder = [];
  const unmatchedSlugs = [];

  const newFP = [];   // { slug, text, clarifier }
  const newMeta = []; // { slug, text, tags }

  for (const e of all) {
    // 1) Skip errored drafts.
    if (e.error !== null && e.error !== undefined) {
      counts.skippedError++;
      continue;
    }
    // 2) Validate the text exists in the question bank (exact match).
    if (!bankTexts.has(e.text)) {
      counts.skippedUnmatched++;
      unmatchedSlugs.push(e.slug);
      console.warn(`  WARN unmatched: ${e.slug} — text not found in question bank: ${JSON.stringify(e.text)}`);
      continue;
    }

    if (e.needs === 'sourced') sourcedReminder.push(e.slug);

    const clarifier = String(e.clarifier ?? '').trim();

    // 3) finePrint — only non-empty clarifiers, never overwrite an existing key.
    if (clarifier) {
      if (e.text in finePrint) {
        counts.skippedExistingFP++;
      } else {
        newFP.push({ slug: e.slug, text: e.text, clarifier });
      }
    }

    // 4) questionMeta — ALL drafts (incl. empty clarifier), never overwrite existing.
    if (e.text in questionMeta) {
      counts.skippedExistingMeta++;
    } else {
      newMeta.push({ slug: e.slug, text: e.text, tags: Array.isArray(e.tags) ? e.tags : [] });
    }
  }

  newFP.sort(bySlug);
  newMeta.sort(bySlug);
  counts.addedFP = newFP.length;
  counts.addedMeta = newMeta.length;

  // ── Write finePrint.js ──
  if (newFP.length) {
    const src = readFileSync(FINE_PRINT_JS, 'utf8');
    const block = [
      SECTION_MARKER,
      ...newFP.map((e) => `  ${q(e.text)}:\n    ${q(e.clarifier)},`),
    ].join('\n') + '\n';
    const headerLine =
      `// Batch bake ${BAKE_DATE}: entries below the "Baked from batch run" marker were added by scripts/bake-fine-print.mjs.`;
    const next = spliceEntries(
      src,
      FINE_PRINT_JS,
      'export const getFinePrint',
      'export const finePrint = {',
      headerLine,
      block,
    );
    writeFileSync(FINE_PRINT_JS, next);
  }

  // ── Write questionMeta.js ──
  if (newMeta.length) {
    const src = readFileSync(QUESTION_META_JS, 'utf8');
    const block = [
      SECTION_MARKER,
      ...newMeta.map(
        (e) => `  ${q(e.text)}:\n    { tags: [${e.tags.map(q).join(', ')}], gardens: [] },`,
      ),
    ].join('\n') + '\n';
    const headerLine =
      `// Batch bake ${BAKE_DATE}: entries below the "Baked from batch run" marker were added by scripts/bake-fine-print.mjs.`;
    const next = spliceEntries(
      src,
      QUESTION_META_JS,
      'const EMPTY = { tags: [], gardens: [] };',
      'export const questionMeta = {',
      headerLine,
      block,
    );
    writeFileSync(QUESTION_META_JS, next);
  }

  // ── Reminder: sourced notes/sources are not baked (no UI slot yet). ──
  if (sourcedReminder.length) {
    console.log('');
    console.log('REMINDER — these "sourced" drafts carry notes + sources that were NOT baked');
    console.log('(no UI slot yet). Their clarifier + tags ARE baked; revisit notes/sources later:');
    for (const slug of sourcedReminder) console.log(`  · ${slug}`);
  }

  // ── Summary ──
  console.log('');
  console.log('══════════════════════════════════════════════════════');
  console.log(' BAKE SUMMARY');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  drafts read              : ${all.length}`);
  console.log(`  added to finePrint.js    : ${counts.addedFP}`);
  console.log(`  added to questionMeta.js : ${counts.addedMeta}`);
  console.log(`  skipped (already in FP)  : ${counts.skippedExistingFP}`);
  console.log(`  skipped (already in Meta): ${counts.skippedExistingMeta}`);
  console.log(`  skipped (error)          : ${counts.skippedError}`);
  console.log(`  skipped (unmatched text) : ${counts.skippedUnmatched}${unmatchedSlugs.length ? ` [${unmatchedSlugs.join(', ')}]` : ''}`);
  console.log('──────────────────────────────────────────────────────');
  console.log(`  finePrint.js    : ${statSync(FINE_PRINT_JS).size} bytes`);
  console.log(`  questionMeta.js : ${statSync(QUESTION_META_JS).size} bytes`);
  if (!newFP.length && !newMeta.length) {
    console.log('  (no new entries — files left untouched; bake is idempotent)');
  }
  console.log('══════════════════════════════════════════════════════');
}

main();
