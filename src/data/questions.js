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

export const gardens = [
  // ── CONTESTED-TOPIC GARDENS ──
  // One specific, contested, real-world topic each, explored through hard yes/no
  // questions that locate the reader's own position (never argue a side).
  {
    id: 'ai', name: 'AI', description: 'Tool or trash, helper or hazard — where do you actually stand?',
    icon: '🤖', color: '#6B7280', seedCost: 200, tier: 2,
    items: [
      { contentType: "question", text: "Do you trust yourself to tell AI writing from human writing?", vibe: "knowledge", difficulty: 3 },
      { contentType: "question", text: "Would you let an AI make a medical decision for you if it outperformed doctors?", vibe: "decision", difficulty: 3 },
      { contentType: "question", text: "Do you think the people building AI understand what they're building?", vibe: "perspective", difficulty: 3 },
      { contentType: "question", text: "Has AI already changed how you think, not just how you work?", vibe: "reflection", difficulty: 3 },
      { contentType: "question", text: "Would you want to know if art that moved you was made by a machine?", vibe: "truth", difficulty: 3 },
      { contentType: "question", text: "Is using AI for your work different from using a calculator?", vibe: "perspective", difficulty: 3 },
      { contentType: "question", text: "Do you believe AI will take more from your life than it gives?", vibe: "fear", difficulty: 3 },
      { contentType: "question", text: "Would you let a child you love grow up with an AI best friend?", vibe: "decision", difficulty: 3 },
      { contentType: "question", text: "Is there a part of your work you'd refuse to hand to AI, even if it did it better?", vibe: "identity", difficulty: 3 },
      { contentType: "question", text: "Do you talk to AI more honestly than you talk to some people?", vibe: "honesty", difficulty: 3 },
    ]
  },
  {
    id: 'goat', name: 'The GOAT', description: "LeBron or Jordan is the surface. What does 'best' even mean?",
    icon: '🐐', color: '#D97706', seedCost: 150, tier: 1,
    items: [
      { contentType: "question", text: "Is the greatest of all time simply whoever won the most?", vibe: "perspective", difficulty: 3 },
      { contentType: "question", text: "Can you be the GOAT without being the most talented player?", vibe: "perspective", difficulty: 3 },
      { contentType: "question", text: "Does dominating a weaker era count for less?", vibe: "knowledge", difficulty: 3 },
      { contentType: "question", text: "Would six-for-six in the Finals settle it for you?", vibe: "decision", difficulty: 3 },
      { contentType: "question", text: "Is twenty great years better than five perfect ones?", vibe: "perspective", difficulty: 3 },
      { contentType: "question", text: "Do the stats tell you more than watching ever could?", vibe: "truth", difficulty: 3 },
      { contentType: "question", text: "Can the GOAT be someone you'd never want as a teammate?", vibe: "perspective", difficulty: 3 },
      { contentType: "question", text: "Does what a player does off the court belong in the conversation?", vibe: "decision", difficulty: 3 },
      { contentType: "question", text: "Is your GOAT pick really about who you grew up watching?", vibe: "honesty", difficulty: 3 },
      { contentType: "question", text: "Will someone alive today make this whole debate obsolete?", vibe: "perspective", difficulty: 3 },
    ]
  },
  {
    id: 'afterlife', name: 'Life After Death', description: 'What happens after — and what does your life say you believe?',
    icon: '🕯️', color: '#6366F1', seedCost: 300, tier: 3,
    items: [
      { contentType: "question", text: "Do you believe some part of you continues after your body dies?", vibe: "mortality", difficulty: 3 },
      { contentType: "question", text: "Do you live as if this life is the only one you get?", vibe: "mortality", difficulty: 3 },
      { contentType: "question", text: "Would you want to know, for certain, what happens after death?", vibe: "truth", difficulty: 3 },
      { contentType: "question", text: "Have you ever felt the presence of someone who's gone?", vibe: "wonder", difficulty: 3 },
      { contentType: "question", text: "Does the idea of simply not existing frighten you?", vibe: "fear", difficulty: 3 },
      { contentType: "question", text: "Would your life change if you knew there was nothing after?", vibe: "decision", difficulty: 3 },
      { contentType: "question", text: "Do you talk to people you've lost?", vibe: "solace", difficulty: 3 },
      { contentType: "question", text: "Is your belief about the afterlife the one you were raised with?", vibe: "identity", difficulty: 3 },
      { contentType: "question", text: "Is being remembered enough of an afterlife for you?", vibe: "legacy", difficulty: 3 },
      { contentType: "question", text: "Have you made peace with not knowing?", vibe: "acceptance", difficulty: 3 },
    ]
  },
  {
    id: 'gaza', name: 'War on Gaza', description: 'Where do you stand — and do you know why?',
    icon: '🌍', color: '#475569', seedCost: 400, tier: 3,
    items: [
      { contentType: "question", text: "Do you know enough about this war to defend your opinion of it?", vibe: "knowledge", difficulty: 3 },
      { contentType: "question", text: "Have you changed your mind about anything in this war since it began?", vibe: "reflection", difficulty: 3 },
      { contentType: "question", text: "Does where you get your news decide what you believe about Gaza?", vibe: "truth", difficulty: 3 },
      { contentType: "question", text: "Can you hold grief for both peoples at once?", vibe: "empathy", difficulty: 3 },
      { contentType: "question", text: "Have you stayed quiet about this war to keep the peace somewhere in your life?", vibe: "courage", difficulty: 3 },
      { contentType: "question", text: "Does this war belong in your voting decisions?", vibe: "decision", difficulty: 3 },
      { contentType: "question", text: "Do you separate a people from their government?", vibe: "perspective", difficulty: 3 },
      { contentType: "question", text: "Is \"it's complicated\" an honest answer for you, or an escape?", vibe: "honesty", difficulty: 3 },
      { contentType: "question", text: "Would you feel differently about this war if you knew someone living it?", vibe: "empathy", difficulty: 3 },
      { contentType: "question", text: "Do you believe peace there is possible in your lifetime?", vibe: "perspective", difficulty: 3 },
    ]
  },
];

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
