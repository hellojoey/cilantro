#!/usr/bin/env node
// Validates the question bank in src/data/questions/*.json
// Checks: schema, unique IDs, duplicate/near-duplicate texts, vibe coverage vs radar mapping.
// Exit code 1 on errors (warnings don't fail).

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const questionsDir = join(root, 'src', 'data', 'questions');
const vibeMap = JSON.parse(readFileSync(join(root, 'src', 'data', 'vibe-dimensions.json'), 'utf8'));

const errors = [];
const warnings = [];

// Normalize text for duplicate detection: lowercase, strip punctuation, collapse whitespace
const normalize = (text) =>
  text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

const seenIds = new Map();      // id -> file
const seenTexts = new Map();    // normalized text -> {id, file}
const vibeCounts = new Map();   // vibe -> count
let total = 0;

const files = readdirSync(questionsDir).filter(f => f.endsWith('.json')).sort();
if (files.length === 0) {
  console.error('No question files found in', questionsDir);
  process.exit(1);
}

for (const file of files) {
  let data;
  try {
    data = JSON.parse(readFileSync(join(questionsDir, file), 'utf8'));
  } catch (e) {
    errors.push(`${file}: invalid JSON — ${e.message}`);
    continue;
  }

  if (!data.category || typeof data.category !== 'string')
    errors.push(`${file}: missing "category" string`);
  if (!data.slug || typeof data.slug !== 'string')
    errors.push(`${file}: missing "slug" string`);
  if (!Array.isArray(data.questions)) {
    errors.push(`${file}: missing "questions" array`);
    continue;
  }

  data.questions.forEach((q, i) => {
    const where = `${file}[${i}]`;
    total++;

    if (!q.id || typeof q.id !== 'string') {
      errors.push(`${where}: missing string "id"`);
    } else {
      if (data.slug && !q.id.startsWith(`${data.slug}-`))
        warnings.push(`${where}: id "${q.id}" doesn't start with slug "${data.slug}-"`);
      if (seenIds.has(q.id)) errors.push(`${where}: duplicate id "${q.id}" (also in ${seenIds.get(q.id)})`);
      else seenIds.set(q.id, file);
    }

    if (!q.text || typeof q.text !== 'string' || q.text.trim().length < 8) {
      errors.push(`${where}: missing or too-short "text"`);
    } else {
      if (!q.text.trim().endsWith('?'))
        warnings.push(`${where}: text doesn't end with "?" — "${q.text}"`);
      const norm = normalize(q.text);
      if (seenTexts.has(norm)) {
        const prev = seenTexts.get(norm);
        errors.push(`${where}: duplicate text of ${prev.id} (${prev.file}) — "${q.text}"`);
      } else {
        seenTexts.set(norm, { id: q.id || where, file });
      }
    }

    if (!q.vibe || typeof q.vibe !== 'string') {
      errors.push(`${where}: missing string "vibe"`);
    } else {
      vibeCounts.set(q.vibe, (vibeCounts.get(q.vibe) || 0) + 1);
      if (!vibeMap[q.vibe])
        warnings.push(`${where}: vibe "${q.vibe}" not in vibe-dimensions.json — won't count toward radar chart`);
    }

    if (![1, 2, 3].includes(q.difficulty))
      errors.push(`${where}: difficulty must be 1, 2, or 3 (got ${JSON.stringify(q.difficulty)})`);
  });
}

console.log(`Checked ${total} questions across ${files.length} files.`);
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} warning(s):`);
  warnings.slice(0, 40).forEach(w => console.log('  -', w));
  if (warnings.length > 40) console.log(`  ... and ${warnings.length - 40} more`);
}
if (errors.length) {
  console.error(`\n✗ ${errors.length} error(s):`);
  errors.slice(0, 60).forEach(e => console.error('  -', e));
  if (errors.length > 60) console.error(`  ... and ${errors.length - 60} more`);
  process.exit(1);
}
console.log('✓ Question bank is valid.');
