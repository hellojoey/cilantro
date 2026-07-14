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
  // ── ORIGINAL 5 GARDENS (now with mixed content) ──
  {
    id: 'shadows', name: 'Shadows', description: 'The parts of yourself you avoid',
    icon: '🌑', color: '#4A5568', seedCost: 300, tier: 3,
    items: [
      { contentType: "question", text: "Are you running from something you should face?", vibe: "shadow", difficulty: 3 },
      { contentType: "quote", text: "One does not become enlightened by imagining figures of light, but by making the darkness conscious.", attribution: "Carl Jung", vibe: "shadow", difficulty: 1 },
      { contentType: "question", text: "Do you judge others for traits you see in yourself?", vibe: "honesty", difficulty: 3 },
      { contentType: "question", text: "Have you been lying to yourself about something important?", vibe: "truth", difficulty: 3 },
      { contentType: "vibe", text: "Sit with the version of yourself you don't show anyone.", vibe: "shadow", difficulty: 1 },
      { contentType: "question", text: "Are you the villain in someone else's story?", vibe: "honesty", difficulty: 3 },
      { contentType: "question", text: "Do you self-sabotage when things are going well?", vibe: "shadow", difficulty: 3 },
      { contentType: "quote", text: "The wound is the place where the light enters you.", attribution: "Rumi", vibe: "wounds", difficulty: 1 },
      { contentType: "question", text: "Do you secretly enjoy other people's failures?", vibe: "honesty", difficulty: 3 },
      { contentType: "question", text: "Are you pretending to be someone you're not?", vibe: "identity", difficulty: 3 },
    ]
  },
  {
    id: 'mirrors', name: 'Mirrors', description: 'Honest reflections on who you are',
    icon: '🪞', color: '#718096', seedCost: 200, tier: 2,
    items: [
      { contentType: "question", text: "Would you want to be friends with yourself?", vibe: "reflection", difficulty: 2 },
      { contentType: "question", text: "Do people know the real you?", vibe: "identity", difficulty: 2 },
      { contentType: "vibe", text: "Look at yourself without any labels. Just you.", vibe: "reflection", difficulty: 1 },
      { contentType: "question", text: "If you met yourself, would you trust you?", vibe: "trust", difficulty: 2 },
      { contentType: "question", text: "Are your values actually reflected in your actions?", vibe: "honesty", difficulty: 3 },
      { contentType: "quote", text: "We don't see things as they are, we see them as we are.", attribution: "Anais Nin", vibe: "reflection", difficulty: 1 },
      { contentType: "question", text: "Are you the same person in private as in public?", vibe: "honesty", difficulty: 2 },
      { contentType: "question", text: "Would your younger self be disappointed in you?", vibe: "reflection", difficulty: 3 },
      { contentType: "question", text: "Are you kind when no one is watching?", vibe: "kindness", difficulty: 2 },
      { contentType: "question", text: "Do you take more than you give?", vibe: "honesty", difficulty: 2 },
    ]
  },
  {
    id: 'crossroads', name: 'Crossroads', description: 'Life decisions and regrets',
    icon: '⚖️', color: '#9F7AEA', seedCost: 250, tier: 2,
    items: [
      { contentType: "question", text: "Is there a decision you've been avoiding?", vibe: "decision", difficulty: 2 },
      { contentType: "question", text: "Are you staying somewhere out of fear, not love?", vibe: "fear", difficulty: 3 },
      { contentType: "quote", text: "In any moment of decision, the best thing you can do is the right thing. The worst thing you can do is nothing.", attribution: "Theodore Roosevelt", vibe: "decision", difficulty: 1 },
      { contentType: "question", text: "Are you in the right career for your soul?", vibe: "purpose", difficulty: 3 },
      { contentType: "vibe", text: "Imagine standing at a fork in the road. One path is familiar. One is not.", vibe: "crossroads", difficulty: 1 },
      { contentType: "question", text: "Are you choosing comfort over growth?", vibe: "growth", difficulty: 2 },
      { contentType: "question", text: "Would you make the same choices if you could start over?", vibe: "reflection", difficulty: 3 },
      { contentType: "question", text: "Are you waiting for permission to live your life?", vibe: "permission", difficulty: 2 },
      { contentType: "question", text: "Is fear making your decisions for you?", vibe: "fear", difficulty: 2 },
      { contentType: "quote", text: "The only way to make sense out of change is to plunge into it, move with it, and join the dance.", attribution: "Alan Watts", vibe: "acceptance", difficulty: 1 },
    ]
  },
  {
    id: 'roots', name: 'Roots', description: 'Family, origin, and belonging',
    icon: '🌳', color: '#48BB78', seedCost: 200, tier: 2,
    items: [
      { contentType: "question", text: "Have you forgiven your parents for their mistakes?", vibe: "forgiveness", difficulty: 3 },
      { contentType: "question", text: "Are you repeating patterns from your childhood?", vibe: "roots", difficulty: 3 },
      { contentType: "vibe", text: "Think of the place that first felt like home.", vibe: "belonging", difficulty: 1 },
      { contentType: "question", text: "Are there family wounds you haven't healed?", vibe: "wounds", difficulty: 3 },
      { contentType: "quote", text: "The apple doesn't fall far from the tree, but it can roll.", attribution: null, vibe: "roots", difficulty: 1 },
      { contentType: "question", text: "Have you become what your family expected?", vibe: "identity", difficulty: 2 },
      { contentType: "question", text: "Is there a conversation with family you need to have?", vibe: "courage", difficulty: 2 },
      { contentType: "question", text: "Do you know where you come from?", vibe: "belonging", difficulty: 1 },
      { contentType: "question", text: "Are you running toward something or away from your past?", vibe: "roots", difficulty: 3 },
      { contentType: "question", text: "Have you made peace with your upbringing?", vibe: "acceptance", difficulty: 3 },
    ]
  },
  {
    id: 'depths', name: 'Depths', description: 'Mortality, meaning, and existence',
    icon: '🌊', color: '#4299E1', seedCost: 400, tier: 3,
    items: [
      { contentType: "question", text: "Are you afraid of dying?", vibe: "mortality", difficulty: 3 },
      { contentType: "question", text: "Do you know what you're living for?", vibe: "purpose", difficulty: 3 },
      { contentType: "quote", text: "The meaning of life is to find your gift. The purpose of life is to give it away.", attribution: "Pablo Picasso", vibe: "purpose", difficulty: 1 },
      { contentType: "question", text: "Have you accepted that you won't live forever?", vibe: "mortality", difficulty: 3 },
      { contentType: "vibe", text: "Close your eyes. Imagine looking at Earth from space. You are here.", vibe: "wonder", difficulty: 1 },
      { contentType: "question", text: "Do you believe you matter in the grand scheme?", vibe: "identity", difficulty: 3 },
      { contentType: "question", text: "Have you found something worth suffering for?", vibe: "purpose", difficulty: 3 },
      { contentType: "question", text: "Are you running out of time for what matters most?", vibe: "mortality", difficulty: 3 },
      { contentType: "quote", text: "We are not human beings having a spiritual experience. We are spiritual beings having a human experience.", attribution: "Pierre Teilhard de Chardin", vibe: "wonder", difficulty: 1 },
      { contentType: "question", text: "Have you truly lived, or just existed?", vibe: "purpose", difficulty: 3 },
    ]
  },

  // ── NEW 3 GARDENS (now with mixed content) ──
  {
    id: 'embers', name: 'Embers', description: 'Love, desire, and intimacy',
    icon: '🔥', color: '#E53E3E', seedCost: 250, tier: 2,
    items: [
      { contentType: "question", text: "Are you in love right now?", vibe: "love", difficulty: 2 },
      { contentType: "question", text: "Have you lost someone you still think about?", vibe: "love", difficulty: 3 },
      { contentType: "vibe", text: "Remember the last time someone made your chest feel warm.", vibe: "love", difficulty: 1 },
      { contentType: "question", text: "Are you afraid of being truly known by someone?", vibe: "vulnerability", difficulty: 3 },
      { contentType: "quote", text: "We accept the love we think we deserve.", attribution: "Stephen Chbosky", vibe: "love", difficulty: 1 },
      { contentType: "question", text: "Do you express love the way your people need it?", vibe: "empathy", difficulty: 3 },
      { contentType: "question", text: "Are you holding onto a love that's already gone?", vibe: "letting_go", difficulty: 3 },
      { contentType: "question", text: "Have you let someone love you fully?", vibe: "vulnerability", difficulty: 3 },
      { contentType: "question", text: "Do you believe you deserve the love you want?", vibe: "desire", difficulty: 3 },
      { contentType: "quote", text: "To love and be loved is to feel the sun from both sides.", attribution: "David Viscott", vibe: "love", difficulty: 1 },
    ]
  },
  {
    id: 'compass', name: 'Compass', description: 'Purpose, calling, and direction',
    icon: '🧭', color: '#DD6B20', seedCost: 300, tier: 3,
    items: [
      { contentType: "question", text: "Do you know what you'd do if money didn't matter?", vibe: "direction", difficulty: 2 },
      { contentType: "question", text: "Are you building someone else's dream?", vibe: "purpose", difficulty: 3 },
      { contentType: "quote", text: "Your work is to discover your world and then with all your heart give yourself to it.", attribution: "Buddha", vibe: "direction", difficulty: 1 },
      { contentType: "question", text: "Do you feel like you're on the right path?", vibe: "direction", difficulty: 2 },
      { contentType: "vibe", text: "Picture where you want to be in five years. Not what — where.", vibe: "direction", difficulty: 1 },
      { contentType: "question", text: "Have you sacrificed passion for stability?", vibe: "crossroads", difficulty: 3 },
      { contentType: "question", text: "Do you wake up excited about your life?", vibe: "purpose", difficulty: 2 },
      { contentType: "question", text: "Are you living by someone else's definition of success?", vibe: "honesty", difficulty: 3 },
      { contentType: "question", text: "Have you followed your curiosity to somewhere unexpected?", vibe: "curiosity", difficulty: 2 },
      { contentType: "quote", text: "Not all those who wander are lost.", attribution: "J.R.R. Tolkien", vibe: "direction", difficulty: 1 },
    ]
  },
  {
    id: 'still', name: 'Still', description: 'Solitude, silence, and inner peace',
    icon: '🕊️', color: '#B794F4', seedCost: 150, tier: 1,
    items: [
      { contentType: "question", text: "Can you sit in silence without reaching for your phone?", vibe: "stillness", difficulty: 2 },
      { contentType: "vibe", text: "Take three slow breaths before continuing.", vibe: "calm", difficulty: 1 },
      { contentType: "question", text: "Have you found a place where you feel completely calm?", vibe: "calm", difficulty: 2 },
      { contentType: "question", text: "Are you comfortable being alone?", vibe: "solitude", difficulty: 2 },
      { contentType: "quote", text: "Almost everything will work again if you unplug it for a few minutes, including you.", attribution: "Anne Lamott", vibe: "rest", difficulty: 1 },
      { contentType: "question", text: "Do you know what peace feels like in your body?", vibe: "peace", difficulty: 2 },
      { contentType: "question", text: "Are you always running from silence?", vibe: "stillness", difficulty: 3 },
      { contentType: "vibe", text: "Listen to the quietest sound you can hear right now.", vibe: "calm", difficulty: 1 },
      { contentType: "question", text: "Do you give yourself permission to do nothing?", vibe: "permission", difficulty: 2 },
      { contentType: "question", text: "Is your inner voice kind or critical?", vibe: "honesty", difficulty: 3 },
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
