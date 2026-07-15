// Validates the Greenhouse palette system against the real question bank.
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PALETTES, CONSTANTS, VIBE_FAMILY, familyForVibe, hexToTriplet } from '../src/theme/palettes.js';

const TOKENS = ['bg', 'soft', 'mid', 'accent', 'deep', 'deeper', 'ink', 'sub', 'card'];
const HEX = /^#[0-9a-f]{6}$/i;
let errors = 0;
const err = (m) => { console.log('  FAIL ' + m); errors++; };

// 1. Structure + hex validity
for (const [family, modes] of Object.entries(PALETTES)) {
  for (const mode of ['light', 'dark']) {
    if (!modes[mode]) { err(`${family}.${mode} missing`); continue; }
    for (const t of TOKENS) {
      const v = modes[mode][t];
      if (!v) err(`${family}.${mode}.${t} missing`);
      else if (!HEX.test(v)) err(`${family}.${mode}.${t} = "${v}" is not a valid hex`);
    }
    const extra = Object.keys(modes[mode]).filter((k) => !TOKENS.includes(k));
    if (extra.length) err(`${family}.${mode} has unexpected tokens: ${extra}`);
  }
}
console.log(`structure: ${Object.keys(PALETTES).length} families x2 modes checked`);

// 2. Every vibe maps to a real family
for (const [vibe, fam] of Object.entries(VIBE_FAMILY)) {
  if (!PALETTES[fam]) err(`vibe "${vibe}" → unknown family "${fam}"`);
}

// 3. Coverage. A vibe can reach the UI from two places: the shipped question
// bank, and api/generate-questions (whose vibe enum is vibe-dimensions.json).
// Both must be themed, or an AI-authored question renders in the wrong palette.
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src', 'data', 'questions');
const bank = new Set();
for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
  for (const q of data.questions) bank.add(q.vibe);
}
const generatable = new Set(
  Object.keys(JSON.parse(readFileSync(join(root, 'src', 'data', 'vibe-dimensions.json'), 'utf8')))
);
const reachable = new Set([...bank, ...generatable]);

const unmapped = [...reachable].filter((v) => !VIBE_FAMILY[v]);
const stale = Object.keys(VIBE_FAMILY).filter((v) => !reachable.has(v));
console.log(`vibes: ${bank.size} in bank, ${generatable.size} generatable, ${reachable.size} reachable`);
if (unmapped.length) err(`reachable vibes with no palette family (would fall back to herb): ${unmapped.join(', ')}`);
if (stale.length) err(`mapped vibes that are unreachable (bank + generatable): ${stale.join(', ')}`);

// 4. Contrast (WCAG relative luminance)
const lum = (hex) => {
  const [r, g, b] = hexToTriplet(hex).split(' ').map(Number).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
// Pairs that carry real text, with the WCAG minimum each must clear.
const PAIRS = [
  ['ink', 'card', 4.5],   // question text on the card
  ['ink', 'bg', 4.5],     // body text on canvas
  ['sub', 'bg', 4.5],     // secondary text on canvas
  ['sub', 'card', 4.5],   // secondary text on card
  ['deep', 'bg', 4.5],    // wordmark / headings on canvas
  ['deep', 'soft', 4.5],  // vibe chip label on its fill
  ['bg', 'deep', 4.5],    // CTA label (bg color) on CTA fill (deep)
];
console.log('\ncontrast:');
for (const [family, modes] of Object.entries(PALETTES)) {
  for (const mode of ['light', 'dark']) {
    for (const [fg, bg, min] of PAIRS) {
      const r = ratio(modes[mode][fg], modes[mode][bg]);
      if (r < min) err(`${family}.${mode}: ${fg} on ${bg} = ${r.toFixed(2)}:1 (needs ${min})`);
    }
    // `negate` is a BACKGROUND-only token (the "no"/error tint). It is vibe-
    // independent, so it has to stay legible under every family's ink.
    const r = ratio(modes[mode].ink, CONSTANTS[mode].negate);
    if (r < 4.5) err(`${family}.${mode}: ink on negate = ${r.toFixed(2)}:1 (needs 4.5)`);
    // `alert` is negate's text-weight counterpart — it must read on both the
    // canvas and a card, under every family.
    for (const surface of ['bg', 'card']) {
      const a = ratio(CONSTANTS[mode].alert, modes[mode][surface]);
      if (a < 4.5) err(`${family}.${mode}: alert on ${surface} = ${a.toFixed(2)}:1 (needs 4.5)`);
    }
  }
}

console.log(errors ? `\n${errors} error(s)` : '\nall checks passed');
process.exit(errors ? 1 : 0);
