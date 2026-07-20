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
// keys → all skipped/already-object → both files left untouched).
//
// SOURCED entries (needs === 'sourced', carrying notes + sources) bake into
// finePrint.js as the OBJECT form:
//   { note, notes, sources: [{ title, publisher, url, perspective }] }
// where `note` is the same one-line clarifier a string entry would carry. Their
// sources are carried through verbatim from the approved drafts — never
// hand-authored or edited here. If a sourced text already exists as a plain
// string entry (an earlier bake), it is UPGRADED in place to the object form,
// keeping its clarifier text as `note`. Everything else bakes as a string.
//
// Optional slug filter: `--only=slug1,slug2` restricts the run to those drafts
// (used to bake just the approved sourced entries without touching anything else).
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

// Same, but also escapes real newlines to `\n` so multi-paragraph notes stay a
// valid single-quoted literal (a raw newline inside '' is a JS syntax error).
const qm = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;

// ── Sourced entry → object-form literal, house style, hand-editable ──
// Emits (key already written by the caller, value indented 4 spaces):
//   {
//     note:
//       '…',
//     notes:
//       '…\n\n…',
//     sources: [
//       { title: '…', publisher: '…', url: '…', perspective: '…' },
//     ],
//   },
function objectFormValue(note, notes, sources) {
  const lines = ['    {'];
  lines.push(`      note:\n        ${qm(note)},`);
  if (notes && notes.trim()) {
    lines.push(`      notes:\n        ${qm(notes)},`);
  }
  if (Array.isArray(sources) && sources.length) {
    lines.push('      sources: [');
    for (const s of sources) {
      lines.push(
        `        { title: ${qm(s.title)}, publisher: ${qm(s.publisher)}, url: ${qm(s.url)}, perspective: ${qm(s.perspective)} },`,
      );
    }
    lines.push('      ],');
  }
  lines.push('    },');
  return lines.join('\n');
}

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
  let all = Object.values(drafts);

  // Optional `--only=slug1,slug2` filter — restrict the run to these slugs.
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const onlySlugs = onlyArg
    ? new Set(onlyArg.slice('--only='.length).split(',').map((s) => s.trim()).filter(Boolean))
    : null;
  if (onlySlugs) {
    all = all.filter((e) => onlySlugs.has(e.slug));
    console.log(`  (--only filter active: ${[...onlySlugs].join(', ')} → ${all.length} draft(s))`);
  }

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
    skippedSourcedObject: 0,
    addedFP: 0,
    addedMeta: 0,
    addedSourced: 0,
    upgradedSourced: 0,
  };
  const unmatchedSlugs = [];

  const newFP = [];       // { slug, text, clarifier }
  const newMeta = [];     // { slug, text, tags }
  const newSourced = [];  // { slug, text, note, notes, sources } — object-form adds
  const upgradeSourced = []; // { slug, text, note, notes, sources } — string → object in place

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

    const clarifier = String(e.clarifier ?? '').trim();
    const isSourced =
      e.needs === 'sourced' &&
      ((e.notes && String(e.notes).trim()) || (Array.isArray(e.sources) && e.sources.length));

    // 3) finePrint.
    if (isSourced) {
      // Object form. sources carried through verbatim — never edited here.
      const record = {
        slug: e.slug,
        text: e.text,
        note: clarifier,
        notes: String(e.notes ?? ''),
        sources: Array.isArray(e.sources) ? e.sources : [],
      };
      const cur = finePrint[e.text];
      if (cur === undefined) {
        newSourced.push(record);
      } else if (typeof cur === 'string') {
        // Upgrade in place, preserving the existing clarifier as `note`.
        upgradeSourced.push({ ...record, note: cur });
      } else {
        counts.skippedSourcedObject++; // already object form → idempotent
      }
    } else if (clarifier) {
      // String form — only non-empty clarifiers, never overwrite an existing key.
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
  newSourced.sort(bySlug);
  upgradeSourced.sort(bySlug);
  counts.addedFP = newFP.length;
  counts.addedMeta = newMeta.length;
  counts.addedSourced = newSourced.length;
  counts.upgradedSourced = upgradeSourced.length;

  // ── Write finePrint.js ──
  if (newFP.length || newSourced.length || upgradeSourced.length) {
    let src = readFileSync(FINE_PRINT_JS, 'utf8');

    // (a) In-place upgrades: replace an existing string entry with its object
    // form, keeping the exact clarifier as `note`. Matches the exact baked
    // block so only that one entry is touched.
    for (const e of upgradeSourced) {
      const oldBlock = `  ${q(e.text)}:\n    ${q(e.note)},`;
      const newBlock = `  ${q(e.text)}:\n${objectFormValue(e.note, e.notes, e.sources)}`;
      if (!src.includes(oldBlock)) {
        throw new Error(`Could not find existing string entry to upgrade for ${e.slug}: ${JSON.stringify(e.text)}`);
      }
      src = src.replace(oldBlock, newBlock);
    }

    // (b) Appends (new string + new sourced object entries) under the dated marker.
    if (newFP.length || newSourced.length) {
      const block = [
        SECTION_MARKER,
        ...newFP.map((e) => `  ${q(e.text)}:\n    ${q(e.clarifier)},`),
        ...newSourced.map((e) => `  ${q(e.text)}:\n${objectFormValue(e.note, e.notes, e.sources)}`),
      ].join('\n') + '\n';
      const headerLine =
        `// Batch bake ${BAKE_DATE}: entries below the "Baked from batch run" marker were added by scripts/bake-fine-print.mjs.`;
      src = spliceEntries(
        src,
        FINE_PRINT_JS,
        'export const getFinePrint',
        'export const finePrint = {',
        headerLine,
        block,
      );
    }

    writeFileSync(FINE_PRINT_JS, src);
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

  // ── Note the sourced entries that were baked as object form. ──
  if (newSourced.length || upgradeSourced.length) {
    console.log('');
    console.log('SOURCED — baked as object form (note + notes + sources, verbatim):');
    for (const e of upgradeSourced) console.log(`  · ${e.slug} (upgraded string → object)`);
    for (const e of newSourced) console.log(`  · ${e.slug} (new object entry)`);
  }

  // ── Summary ──
  console.log('');
  console.log('══════════════════════════════════════════════════════');
  console.log(' BAKE SUMMARY');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  drafts read              : ${all.length}`);
  console.log(`  added to finePrint.js    : ${counts.addedFP}`);
  console.log(`  sourced added (object)   : ${counts.addedSourced}`);
  console.log(`  sourced upgraded (str→obj): ${counts.upgradedSourced}`);
  console.log(`  added to questionMeta.js : ${counts.addedMeta}`);
  console.log(`  skipped (already in FP)  : ${counts.skippedExistingFP}`);
  console.log(`  skipped (sourced, already object): ${counts.skippedSourcedObject}`);
  console.log(`  skipped (already in Meta): ${counts.skippedExistingMeta}`);
  console.log(`  skipped (error)          : ${counts.skippedError}`);
  console.log(`  skipped (unmatched text) : ${counts.skippedUnmatched}${unmatchedSlugs.length ? ` [${unmatchedSlugs.join(', ')}]` : ''}`);
  console.log('──────────────────────────────────────────────────────');
  console.log(`  finePrint.js    : ${statSync(FINE_PRINT_JS).size} bytes`);
  console.log(`  questionMeta.js : ${statSync(QUESTION_META_JS).size} bytes`);
  if (!newFP.length && !newMeta.length && !newSourced.length && !upgradeSourced.length) {
    console.log('  (no new entries — files left untouched; bake is idempotent)');
  }
  console.log('══════════════════════════════════════════════════════');
}

main();
