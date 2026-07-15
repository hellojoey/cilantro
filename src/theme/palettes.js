// Greenhouse adaptive palettes
// ─────────────────────────────
// Herb green is home base; the whole scene re-tints to the question's vibe.
// The bank carries ~97 distinct vibe strings, so vibes are grouped into a small
// set of curated families rather than given a palette each — a hashed hue per
// vibe (the v3 `vibeColor` approach) can't guarantee contrast or coherence.
// Any vibe with no family listed falls back to herb.
//
// Spec: design/concepts.html, concept c2.

// Each family defines the same nine tokens in light and dark:
//   bg     canvas
//   soft   tinted fill (vibe chip, tag)
//   mid    stronger tint (borders, hover fill)
//   accent saturated brand color (shapes, dots)
//   deep   strong color: headings, CTA fill
//   deeper CTA hard shadow
//   ink    primary text + card borders/shadows
//   sub    secondary text
//   card   card surface
export const PALETTES = {
  // Home base. Curiosity, craft, making, growing things.
  herb: {
    light: { bg: '#f2f6ee', soft: '#e4efd2', mid: '#cde3b8', accent: '#7fb069', deep: '#43682f', deeper: '#2f4c20', ink: '#2f3a2a', sub: '#5a6e4d', card: '#ffffff' },
    dark:  { bg: '#161a13', soft: '#243021', mid: '#33422e', accent: '#94b585', deep: '#a8c99a', deeper: '#5c7a4e', ink: '#e6ece2', sub: '#8fa085', card: '#1e241b' },
  },
  // Society, judgment, what's true and who to trust.
  slate: {
    light: { bg: '#eef3f7', soft: '#dbe7f0', mid: '#b9d4e6', accent: '#6898bd', deep: '#2f5875', deeper: '#234259', ink: '#26333d', sub: '#526677', card: '#ffffff' },
    dark:  { bg: '#12171b', soft: '#1e2a33', mid: '#2b3c48', accent: '#7ba9cc', deep: '#9dc4e0', deeper: '#456e8c', ink: '#e0e8ee', sub: '#849aab', card: '#191f25' },
  },
  // Intimacy, love, the people who mark you.
  plum: {
    light: { bg: '#f6eff4', soft: '#ecdbe8', mid: '#dcc0d4', accent: '#b07fa4', deep: '#6d3f60', deeper: '#532e49', ink: '#3a2a35', sub: '#74596c', card: '#ffffff' },
    dark:  { bg: '#191419', soft: '#2b2029', mid: '#3d2e39', accent: '#c495b8', deep: '#d9aecd', deeper: '#7a5670', ink: '#eee3ea', sub: '#a48a9c', card: '#221b21' },
  },
  // Joy, play, delight, the unserious.
  amber: {
    light: { bg: '#fbf4e9', soft: '#f7e6c9', mid: '#efd3a0', accent: '#d99a3c', deep: '#8a5a1c', deeper: '#6b4413', ink: '#3d3226', sub: '#756046', card: '#ffffff' },
    dark:  { bg: '#1a1610', soft: '#2e2517', mid: '#413522', accent: '#dfae5e', deep: '#eec87f', deeper: '#8a6428', ink: '#efe7d9', sub: '#a8937a', card: '#231e15' },
  },
  // Night: mortality, fear, dreams, the parts you don't show.
  indigo: {
    light: { bg: '#f0f0f8', soft: '#dedef0', mid: '#c2c2e0', accent: '#7676b8', deep: '#3f3f75', deeper: '#2e2e59', ink: '#2a2a38', sub: '#6b6b8a', card: '#ffffff' },
    dark:  { bg: '#131320', soft: '#20203a', mid: '#2e2e4f', accent: '#8f8fd0', deep: '#b0b0e4', deeper: '#4f4f8c', ink: '#e4e4f0', sub: '#8a8aaa', card: '#1a1a2b' },
  },
  // Calm, rest, care, being okay.
  teal: {
    light: { bg: '#ecf5f4', soft: '#d5eae7', mid: '#aed6d1', accent: '#4f9d95', deep: '#2a5f5a', deeper: '#1d4744', ink: '#243634', sub: '#4c6a66', card: '#ffffff' },
    dark:  { bg: '#101a19', soft: '#1b2c2a', mid: '#26403d', accent: '#6bb3ab', deep: '#8fd0c7', deeper: '#3a726b', ink: '#dfeceb', sub: '#7f9d99', card: '#17201f' },
  },
  // Grit, courage, wanting things and going after them.
  clay: {
    light: { bg: '#faf0ec', soft: '#f3ded4', mid: '#e6c0af', accent: '#c07a58', deep: '#7d4228', deeper: '#5f311d', ink: '#3b2b24', sub: '#75574a', card: '#ffffff' },
    dark:  { bg: '#1a1311', soft: '#2d211c', mid: '#402f27', accent: '#d19478', deep: '#e6b299', deeper: '#8a5236', ink: '#f0e4de', sub: '#a8887a', card: '#231a16' },
  },
};

export const DEFAULT_FAMILY = 'herb';

// Mode-scoped but NOT vibe-scoped. `negate` is the "no"/error tint: it stays
// steady across every palette so a rejection never reads warmer or cooler by
// topic. Emitted onto bare :root/.dark by the generator.
// `negate` is the "no"/error FILL — a near-canvas tint, legible only as a
// background under ink. `alert` is its text-weight counterpart, for when a
// negative status needs to be read as words (a spend, a refusal). Both stay
// constant across vibes so a rejection never reads warmer or cooler by topic.
export const CONSTANTS = {
  light: { negate: '#f5d9cf', alert: '#a13c29' },
  dark: { negate: '#4a2b26', alert: '#f0a294' },
};

// Vibe → family. Vibes absent from this map render in herb.
export const VIBE_FAMILY = {
  // slate — society, judgment, what's true
  honesty: 'slate', discipline: 'slate', knowledge: 'slate', boundaries: 'slate',
  humility: 'slate', clarity: 'slate', intention: 'slate', reflection: 'slate',
  identity: 'slate', priority: 'slate', trust: 'slate', truth: 'slate',
  perspective: 'slate', decision: 'slate', feedback: 'slate', direction: 'slate',

  // plum — intimacy, love, the people who mark you
  resonance: 'plum', warmth: 'plum', vulnerability: 'plum', connection: 'plum',
  kindness: 'plum', forgiveness: 'plum', generosity: 'plum', friendship: 'plum',
  listening: 'plum', empathy: 'plum', love: 'plum', reconciliation: 'plum',
  belonging: 'plum', letting_go: 'plum', wounds: 'plum', gentleness: 'plum',

  // amber — joy, play, delight
  playful: 'amber', humor: 'amber', joy: 'amber', taste: 'amber',
  adventure: 'amber', silly: 'amber', fandom: 'amber', delight: 'amber',
  immersion: 'amber', whimsy: 'amber', carefree: 'amber', celebration: 'amber',
  indulgence: 'amber', escapism: 'amber', spontaneous: 'amber',

  // indigo — night, mortality, the unshown
  wonder: 'indigo', fear: 'indigo', dreams: 'indigo', solitude: 'indigo',
  emotion: 'indigo', intuition: 'indigo', discomfort: 'indigo', surrender: 'indigo',
  shadow: 'indigo', mortality: 'indigo', legacy: 'indigo',

  // teal — calm, rest, care
  comfort: 'teal', health: 'teal', mindfulness: 'teal', gratitude: 'teal',
  rest: 'teal', patience: 'teal', peace: 'teal', balance: 'teal',
  selfcare: 'teal', permission: 'teal', presence: 'teal', appreciation: 'teal',
  nourishment: 'teal', stillness: 'teal', acceptance: 'teal', calm: 'teal',

  // clay — grit, courage, drive
  grit: 'clay', courage: 'clay', resourcefulness: 'clay', learning: 'clay',
  growth: 'clay', progress: 'clay', passion: 'clay', purpose: 'clay',
  persistence: 'clay', ambition: 'clay', becoming: 'clay', strength: 'clay',

  // herb — home base (listed for intent; the fallback covers them anyway)
  curiosity: 'herb', craft: 'herb', memory: 'herb', nature: 'herb',
  creation: 'herb', skill: 'herb', beauty: 'herb', expression: 'herb',
  nostalgia: 'herb', imagination: 'herb', inspiration: 'herb', experimentation: 'herb',

  // Not in the 2k bank yet, but `api/generate-questions` can emit them (its vibe
  // enum comes from vibe-dimensions.json). Mapped so an AI-authored question
  // arrives themed rather than silently falling back to herb.
  crossroads: 'slate', resilience: 'clay', desire: 'plum', roots: 'plum',
  solace: 'teal', daily: 'herb', garden: 'herb',
};

export const familyForVibe = (vibe) => VIBE_FAMILY[vibe] || DEFAULT_FAMILY;

// The literal accent hex of a vibe's family, for the small per-vibe dots that
// sit in lists next to *other* vibes (Profile's answer log, Welcome's row) —
// those can't read the active palette, since each dot needs its own color.
// Replaces v3's `vibeColor` hash, which produced an arbitrary hue per string
// and so never matched the scene it sat in.
export const vibeAccent = (vibe, mode = 'light') =>
  PALETTES[familyForVibe(vibe)][mode].accent;

// '#7fb069' → '127 176 105' — the space-separated triplet Tailwind needs so
// `rgb(var(--c-accent) / <alpha-value>)` supports opacity modifiers.
export const hexToTriplet = (hex) => {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

// Write a family's tokens onto an element as CSS custom properties.
export const applyPalette = (el, family, mode) => {
  const palette = (PALETTES[family] || PALETTES[DEFAULT_FAMILY])[mode];
  for (const [token, hex] of Object.entries(palette)) {
    el.style.setProperty(`--c-${token}`, hexToTriplet(hex));
  }
};
