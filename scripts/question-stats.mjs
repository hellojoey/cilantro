#!/usr/bin/env node
// Prints stats about the question bank: per-category counts, difficulty spread,
// top vibes, and radar dimension coverage.

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const questionsDir = join(root, 'src', 'data', 'questions');
const vibeMap = JSON.parse(readFileSync(join(root, 'src', 'data', 'vibe-dimensions.json'), 'utf8'));

const files = readdirSync(questionsDir).filter(f => f.endsWith('.json')).sort();
const categories = files.map(f => JSON.parse(readFileSync(join(questionsDir, f), 'utf8')));

let total = 0;
const difficulty = { 1: 0, 2: 0, 3: 0 };
const vibes = new Map();
const dimensions = new Map();

console.log('── Questions per category ──');
for (const cat of categories) {
  console.log(`  ${cat.category.padEnd(32)} ${cat.questions.length}`);
  total += cat.questions.length;
  for (const q of cat.questions) {
    difficulty[q.difficulty] = (difficulty[q.difficulty] || 0) + 1;
    vibes.set(q.vibe, (vibes.get(q.vibe) || 0) + 1);
    for (const d of vibeMap[q.vibe] || []) {
      dimensions.set(d, (dimensions.get(d) || 0) + 1);
    }
  }
}
console.log(`  ${'TOTAL'.padEnd(32)} ${total}`);

console.log('\n── Difficulty spread ──');
for (const [d, n] of Object.entries(difficulty)) {
  console.log(`  ${d}: ${n} (${Math.round((n / total) * 100)}%)`);
}

console.log('\n── Radar dimension coverage ──');
for (const [d, n] of [...dimensions.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${d.padEnd(12)} ${n}`);
}

console.log(`\n── Vibes (${vibes.size} unique, top 25) ──`);
for (const [v, n] of [...vibes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) {
  console.log(`  ${v.padEnd(18)} ${n}`);
}
