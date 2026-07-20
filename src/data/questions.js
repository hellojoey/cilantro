// Cilantro - Question Data & Constants
// v3.1: Question bank lives in per-category JSON files (src/data/questions/*.json)
// Add questions there (or via the /addquestions workflow), then run `npm run questions:validate`

import deepReflective from './questions/deep-reflective.json' with { type: 'json' };
import lighthearted from './questions/lighthearted.json' with { type: 'json' };
import social from './questions/social.json' with { type: 'json' };
import popCulture from './questions/pop-culture.json' with { type: 'json' };
import trivia from './questions/trivia.json' with { type: 'json' };
import wellness from './questions/wellness.json' with { type: 'json' };
import creativity from './questions/creativity.json' with { type: 'json' };
import growth from './questions/growth.json' with { type: 'json' };
import vibeDimensionMap from './vibe-dimensions.json' with { type: 'json' };

export const questionCategories = [
  deepReflective,
  lighthearted,
  social,
  popCulture,
  trivia,
  wellness,
  creativity,
  growth,
];

export const questions = questionCategories.flatMap(c => c.questions);

// ── Deterministic color from any vibe string ──
export const vibeColor = (vibe) => {
  if (!vibe) return '#a8a29e';
  let hash = 0;
  for (let i = 0; i < vibe.length; i++) hash = vibe.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 45%, 65%)`;
};

// ── Radar Chart Dimensions ──
export const radarDimensions = ['Honesty', 'Empathy', 'Resilience', 'Courage', 'Curiosity', 'Discipline'];

// ── Vibe → Radar Dimension Mapping ──
// Lives in vibe-dimensions.json so scripts and the app share one source of truth
export const vibeToDimensions = vibeDimensionMap;

// ── Calculate radar scores from answers ──
export const calculateRadarScores = (answers) => {
  const counts = {};
  const yesCounts = {};
  radarDimensions.forEach(d => { counts[d] = 0; yesCounts[d] = 0; });

  answers.forEach(a => {
    const dims = vibeToDimensions[a.vibe] || [];
    dims.forEach(d => {
      if (counts[d] !== undefined) {
        counts[d]++;
        if (a.answer === 'yes') yesCounts[d]++;
      }
    });
  });

  return radarDimensions.map(d => {
    if (counts[d] < 3) return null; // Not enough data
    return Math.round((yesCounts[d] / counts[d]) * 100);
  });
};

// Gardens now live in per-garden JSON (src/data/gardens/*.json) as root + branches;
// the builder derives the flat `items` list every existing consumer still reads.
export { gardens } from './gardens.js';

// Seeds economy constants
export const SEEDS = {
  STARTING_BALANCE: 0,
  CHANGE_ANSWER_COST: 5,
  PEEK_COST: 10,
  DAILY_30_BASE_BONUS: 30,
  DAILY_30_STREAK_MULTIPLIER: 5,
  GARDEN_COMPLETION_MULTIPLIER: 2,
};

// Generate consistent Daily 30 questions based on date (same for all users)
export const getDailyQuestions = () => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor((Math.sin(seed + i) * 10000) % (i + 1));
    const k = j < 0 ? -j : j;
    [shuffled[i], shuffled[k % (i + 1)]] = [shuffled[k % (i + 1)], shuffled[i]];
  }

  return shuffled.slice(0, 30);
};

// Format timestamp to readable format
export const formatTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Legacy type → vibe migration mapping (for localStorage data)
export const typeToVibeMigration = {
  deep: 'reflection',
  light: 'playful',
  social: 'connection',
  popculture: 'fandom',
  trivia: 'knowledge',
  wellness: 'health',
  creativity: 'creation',
  growth: 'ambition',
  garden: 'garden',
  daily30: 'daily',
};
