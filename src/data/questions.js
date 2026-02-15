// Cilantro - Question Data & Constants
// v3.0: Freeform vibes, mixed-content gardens, radar chart dimensions
// 200 base questions + 8 gardens (80 mixed items)

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
// Each vibe maps to 1-2 character dimensions it primarily relates to
export const vibeToDimensions = {
  // Deep & reflective vibes
  peace: ['Resilience'],
  identity: ['Honesty', 'Courage'],
  intuition: ['Curiosity', 'Courage'],
  forgiveness: ['Empathy', 'Courage'],
  honesty: ['Honesty'],
  stillness: ['Discipline', 'Resilience'],
  letting_go: ['Courage', 'Resilience'],
  gratitude: ['Empathy'],
  perspective: ['Honesty', 'Curiosity'],
  kindness: ['Empathy'],
  emotion: ['Empathy', 'Courage'],
  fear: ['Courage'],
  truth: ['Honesty', 'Courage'],
  solitude: ['Discipline', 'Resilience'],
  intention: ['Discipline', 'Honesty'],
  growth: ['Resilience', 'Curiosity'],
  beauty: ['Curiosity', 'Empathy'],
  boundaries: ['Discipline', 'Courage'],
  gentleness: ['Empathy'],
  wounds: ['Resilience', 'Honesty'],
  connection: ['Empathy'],
  becoming: ['Courage', 'Honesty'],
  discomfort: ['Courage', 'Resilience'],
  permission: ['Courage'],

  // Light-hearted vibes
  humor: ['Curiosity'],
  joy: ['Empathy', 'Curiosity'],
  playful: ['Curiosity'],
  comfort: ['Empathy'],
  spontaneous: ['Courage', 'Curiosity'],
  silly: ['Curiosity', 'Courage'],
  nostalgia: ['Empathy'],
  whimsy: ['Curiosity'],
  indulgence: ['Courage'],
  carefree: ['Curiosity'],
  delight: ['Empathy', 'Curiosity'],

  // Social vibes
  appreciation: ['Empathy', 'Honesty'],
  friendship: ['Empathy'],
  warmth: ['Empathy'],
  listening: ['Empathy', 'Discipline'],
  vulnerability: ['Courage', 'Honesty'],
  reconciliation: ['Empathy', 'Courage'],
  generosity: ['Empathy'],
  trust: ['Honesty', 'Empathy'],
  celebration: ['Empathy'],
  presence: ['Discipline', 'Empathy'],

  // Pop culture vibes
  passion: ['Courage', 'Curiosity'],
  fandom: ['Curiosity'],
  immersion: ['Curiosity', 'Discipline'],
  taste: ['Honesty', 'Curiosity'],
  escapism: ['Curiosity'],
  resonance: ['Empathy', 'Curiosity'],

  // Trivia vibes
  knowledge: ['Curiosity', 'Discipline'],
  skill: ['Discipline', 'Curiosity'],
  memory: ['Curiosity'],
  adventure: ['Courage', 'Curiosity'],
  resourcefulness: ['Curiosity', 'Resilience'],

  // Wellness vibes
  health: ['Discipline'],
  rest: ['Discipline', 'Resilience'],
  nature: ['Curiosity'],
  mindfulness: ['Discipline', 'Resilience'],
  selfcare: ['Discipline', 'Empathy'],
  balance: ['Discipline', 'Honesty'],
  strength: ['Resilience', 'Courage'],
  nourishment: ['Discipline'],

  // Creativity vibes
  dreams: ['Curiosity'],
  creation: ['Curiosity', 'Courage'],
  imagination: ['Curiosity'],
  inspiration: ['Curiosity', 'Empathy'],
  expression: ['Courage', 'Honesty'],
  experimentation: ['Curiosity', 'Courage'],
  craft: ['Discipline', 'Curiosity'],
  wonder: ['Curiosity', 'Empathy'],

  // Growth vibes
  learning: ['Curiosity', 'Discipline'],
  ambition: ['Discipline', 'Courage'],
  grit: ['Resilience', 'Discipline'],
  feedback: ['Honesty', 'Courage'],
  persistence: ['Resilience', 'Discipline'],
  purpose: ['Honesty', 'Courage'],
  patience: ['Resilience', 'Discipline'],
  progress: ['Resilience', 'Discipline'],
  decision: ['Courage', 'Honesty'],
  priority: ['Discipline', 'Honesty'],

  // Garden-specific vibes
  shadow: ['Honesty', 'Courage'],
  reflection: ['Honesty'],
  crossroads: ['Courage', 'Honesty'],
  roots: ['Empathy', 'Resilience'],
  mortality: ['Courage', 'Honesty'],
  love: ['Empathy', 'Courage'],
  direction: ['Discipline', 'Courage'],
  calm: ['Resilience', 'Discipline'],
  acceptance: ['Resilience', 'Empathy'],
  legacy: ['Honesty', 'Discipline'],
  desire: ['Courage', 'Honesty'],
  belonging: ['Empathy'],
  solace: ['Resilience'],
  clarity: ['Honesty', 'Discipline'],
  surrender: ['Courage', 'Resilience'],

  // Fallbacks
  daily: ['Curiosity'],
  garden: ['Curiosity'],
};

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

export const questions = [
  // ═══════════════════════════════════════════════
  // DEEP & REFLECTIVE (25 questions)
  // ═══════════════════════════════════════════════
  { text: "Did you feel at peace today?", vibe: "peace", difficulty: 2 },
  { text: "Are you proud of who you're becoming?", vibe: "becoming", difficulty: 3 },
  { text: "Did you listen to your intuition recently?", vibe: "intuition", difficulty: 2 },
  { text: "Is there something you need to forgive yourself for?", vibe: "forgiveness", difficulty: 3 },
  { text: "Are you being honest with yourself?", vibe: "honesty", difficulty: 3 },
  { text: "Did you make time for silence today?", vibe: "stillness", difficulty: 1 },
  { text: "Are you holding onto something you should let go?", vibe: "letting_go", difficulty: 3 },
  { text: "Did you feel grateful for something small?", vibe: "gratitude", difficulty: 1 },
  { text: "Are you where you thought you'd be at this point in life?", vibe: "perspective", difficulty: 3 },
  { text: "Did you choose kindness over being right?", vibe: "kindness", difficulty: 2 },
  { text: "Is your heart lighter than it was yesterday?", vibe: "emotion", difficulty: 2 },
  { text: "Did you do something that scared you?", vibe: "fear", difficulty: 2 },
  { text: "Have you been avoiding a truth about yourself?", vibe: "truth", difficulty: 3 },
  { text: "Did you spend time with your thoughts today?", vibe: "solitude", difficulty: 2 },
  { text: "Are you living with intention?", vibe: "intention", difficulty: 3 },
  { text: "Have you outgrown a version of yourself recently?", vibe: "growth", difficulty: 3 },
  { text: "Did you notice something beautiful that others missed?", vibe: "beauty", difficulty: 1 },
  { text: "Are you carrying a burden that isn't yours to carry?", vibe: "boundaries", difficulty: 3 },
  { text: "Did you honor a boundary today?", vibe: "boundaries", difficulty: 2 },
  { text: "Have you been gentle with yourself lately?", vibe: "gentleness", difficulty: 2 },
  { text: "Is there a wound you keep reopening?", vibe: "wounds", difficulty: 3 },
  { text: "Did you feel truly seen by someone today?", vibe: "connection", difficulty: 2 },
  { text: "Are you becoming more yourself or less?", vibe: "becoming", difficulty: 3 },
  { text: "Have you sat with an uncomfortable emotion recently?", vibe: "discomfort", difficulty: 3 },
  { text: "Did you give yourself permission to feel today?", vibe: "permission", difficulty: 2 },

  // ═══════════════════════════════════════════════
  // LIGHT-HEARTED & FUN (25 questions)
  // ═══════════════════════════════════════════════
  { text: "Did you laugh out loud today?", vibe: "humor", difficulty: 1 },
  { text: "Have you danced when nobody was watching?", vibe: "spontaneous", difficulty: 1 },
  { text: "Did you eat something delicious?", vibe: "delight", difficulty: 1 },
  { text: "Have you taken a really good nap recently?", vibe: "comfort", difficulty: 1 },
  { text: "Did you sing in the shower?", vibe: "playful", difficulty: 1 },
  { text: "Have you worn your favorite outfit this week?", vibe: "joy", difficulty: 1 },
  { text: "Did you pet a dog or cat today?", vibe: "warmth", difficulty: 1 },
  { text: "Have you watched the clouds go by?", vibe: "peace", difficulty: 1 },
  { text: "Did you treat yourself to something nice?", vibe: "indulgence", difficulty: 1 },
  { text: "Have you stayed in pajamas all day (unapologetically)?", vibe: "carefree", difficulty: 1 },
  { text: "Did you take a photo of something beautiful?", vibe: "beauty", difficulty: 1 },
  { text: "Have you had breakfast for dinner?", vibe: "playful", difficulty: 1 },
  { text: "Did you try a new food recently?", vibe: "curiosity", difficulty: 1 },
  { text: "Have you done something silly today?", vibe: "silly", difficulty: 1 },
  { text: "Did you say something that made yourself laugh?", vibe: "humor", difficulty: 1 },
  { text: "Have you splashed in a puddle as an adult?", vibe: "whimsy", difficulty: 1 },
  { text: "Did you make a wish on something today?", vibe: "whimsy", difficulty: 1 },
  { text: "Have you worn mismatched socks on purpose?", vibe: "silly", difficulty: 1 },
  { text: "Did you doodle or draw something just for fun?", vibe: "creation", difficulty: 1 },
  { text: "Have you had an entire conversation with a pet?", vibe: "playful", difficulty: 1 },
  { text: "Did you eat dessert first?", vibe: "spontaneous", difficulty: 1 },
  { text: "Have you made a blanket fort as an adult?", vibe: "whimsy", difficulty: 1 },
  { text: "Did you wave at a baby today?", vibe: "warmth", difficulty: 1 },
  { text: "Have you used a silly voice for no reason?", vibe: "silly", difficulty: 1 },
  { text: "Did you find money in an old pocket?", vibe: "delight", difficulty: 1 },

  // ═══════════════════════════════════════════════
  // SOCIAL & RELATIONSHIPS (25 questions)
  // ═══════════════════════════════════════════════
  { text: "Did you tell someone you appreciate them?", vibe: "appreciation", difficulty: 2 },
  { text: "Have you called a friend just to chat?", vibe: "friendship", difficulty: 1 },
  { text: "Did you make someone smile today?", vibe: "warmth", difficulty: 1 },
  { text: "Have you hugged someone you love?", vibe: "love", difficulty: 1 },
  { text: "Did you really listen when someone talked to you?", vibe: "listening", difficulty: 2 },
  { text: "Have you reconnected with an old friend?", vibe: "friendship", difficulty: 2 },
  { text: "Did you ask someone how they're really doing?", vibe: "empathy", difficulty: 2 },
  { text: "Have you shared a meal with someone?", vibe: "connection", difficulty: 1 },
  { text: "Did you compliment a stranger?", vibe: "generosity", difficulty: 2 },
  { text: "Have you sent a thinking-of-you text?", vibe: "friendship", difficulty: 1 },
  { text: "Did you forgive someone today?", vibe: "forgiveness", difficulty: 3 },
  { text: "Have you made plans to see someone you miss?", vibe: "connection", difficulty: 2 },
  { text: "Did you let someone help you today?", vibe: "vulnerability", difficulty: 2 },
  { text: "Have you told someone they inspire you?", vibe: "appreciation", difficulty: 2 },
  { text: "Did you hold space for someone's feelings?", vibe: "listening", difficulty: 3 },
  { text: "Have you said sorry when you were wrong?", vibe: "honesty", difficulty: 3 },
  { text: "Did you celebrate someone else's win today?", vibe: "celebration", difficulty: 1 },
  { text: "Have you had a deep conversation recently?", vibe: "vulnerability", difficulty: 2 },
  { text: "Did you introduce two people who should know each other?", vibe: "generosity", difficulty: 2 },
  { text: "Have you checked in on someone who went quiet?", vibe: "empathy", difficulty: 2 },
  { text: "Did you let someone go first today?", vibe: "kindness", difficulty: 1 },
  { text: "Have you thanked someone who's always there?", vibe: "gratitude", difficulty: 2 },
  { text: "Did you share something vulnerable with someone?", vibe: "vulnerability", difficulty: 3 },
  { text: "Have you laughed with someone until it hurt?", vibe: "joy", difficulty: 1 },
  { text: "Did you put your phone away during a conversation?", vibe: "presence", difficulty: 2 },

  // ═══════════════════════════════════════════════
  // POP CULTURE & ENTERTAINMENT (25 questions)
  // ═══════════════════════════════════════════════
  { text: "Have you watched a movie that made you cry?", vibe: "resonance", difficulty: 1 },
  { text: "Do you know all the words to a Taylor Swift song?", vibe: "fandom", difficulty: 1 },
  { text: "Have you binged an entire series in one sitting?", vibe: "immersion", difficulty: 1 },
  { text: "Did you get emotionally attached to a fictional character?", vibe: "resonance", difficulty: 1 },
  { text: "Have you ever dressed up for a movie premiere?", vibe: "fandom", difficulty: 1 },
  { text: "Do you have a celebrity crush?", vibe: "playful", difficulty: 1 },
  { text: "Have you cried during an animated movie?", vibe: "resonance", difficulty: 1 },
  { text: "Did you rewatch a comfort show recently?", vibe: "comfort", difficulty: 1 },
  { text: "Have you listened to a song on repeat for hours?", vibe: "immersion", difficulty: 1 },
  { text: "Do you know more about a fictional universe than real history?", vibe: "escapism", difficulty: 1 },
  { text: "Have you quoted a movie in a real conversation?", vibe: "humor", difficulty: 1 },
  { text: "Did you discover a new artist you love?", vibe: "passion", difficulty: 1 },
  { text: "Have you had a song stuck in your head all day?", vibe: "immersion", difficulty: 1 },
  { text: "Did a TV show change your perspective on something?", vibe: "resonance", difficulty: 2 },
  { text: "Have you stayed up too late finishing a book?", vibe: "passion", difficulty: 1 },
  { text: "Do you have a comfort movie you've seen 10+ times?", vibe: "comfort", difficulty: 1 },
  { text: "Have you cried at a song in public?", vibe: "vulnerability", difficulty: 1 },
  { text: "Did you learn something real from a fictional story?", vibe: "curiosity", difficulty: 2 },
  { text: "Have you recommended a show to everyone you know?", vibe: "passion", difficulty: 1 },
  { text: "Do you have a playlist for your current mood?", vibe: "expression", difficulty: 1 },
  { text: "Have you cosplayed or wanted to?", vibe: "fandom", difficulty: 1 },
  { text: "Did a podcast make you rethink something?", vibe: "curiosity", difficulty: 2 },
  { text: "Have you felt understood by a song lyric?", vibe: "resonance", difficulty: 1 },
  { text: "Do you judge a person by their taste in music?", vibe: "taste", difficulty: 1 },
  { text: "Have you written fan fiction or wanted to?", vibe: "creation", difficulty: 1 },

  // ═══════════════════════════════════════════════
  // TRIVIA & RANDOM (25 questions)
  // ═══════════════════════════════════════════════
  { text: "Can you name all the planets in order?", vibe: "knowledge", difficulty: 2 },
  { text: "Do you know your blood type?", vibe: "knowledge", difficulty: 1 },
  { text: "Have you ever seen a shooting star?", vibe: "wonder", difficulty: 1 },
  { text: "Can you fold a paper crane?", vibe: "skill", difficulty: 2 },
  { text: "Do you know how to read a map without GPS?", vibe: "resourcefulness", difficulty: 2 },
  { text: "Have you ever grown something from a seed?", vibe: "patience", difficulty: 1 },
  { text: "Can you name a constellation in the night sky?", vibe: "knowledge", difficulty: 2 },
  { text: "Do you remember your childhood phone number?", vibe: "memory", difficulty: 2 },
  { text: "Have you ever been to a different continent?", vibe: "adventure", difficulty: 1 },
  { text: "Can you cook a meal without a recipe?", vibe: "resourcefulness", difficulty: 1 },
  { text: "Do you know the capital of Australia?", vibe: "knowledge", difficulty: 2 },
  { text: "Have you ever written a letter by hand?", vibe: "craft", difficulty: 1 },
  { text: "Can you name five countries that start with 'M'?", vibe: "knowledge", difficulty: 2 },
  { text: "Do you know what your name means?", vibe: "identity", difficulty: 1 },
  { text: "Have you ever been awake for more than 24 hours?", vibe: "grit", difficulty: 1 },
  { text: "Can you ride a bicycle with no hands?", vibe: "skill", difficulty: 2 },
  { text: "Do you know how to change a tire?", vibe: "resourcefulness", difficulty: 2 },
  { text: "Have you ever seen the Northern Lights?", vibe: "wonder", difficulty: 1 },
  { text: "Can you whistle a full melody?", vibe: "skill", difficulty: 1 },
  { text: "Do you know how to swim?", vibe: "skill", difficulty: 1 },
  { text: "Have you ever caught a fish?", vibe: "adventure", difficulty: 1 },
  { text: "Can you do mental math faster than your phone?", vibe: "skill", difficulty: 2 },
  { text: "Do you know your Wi-Fi password by heart?", vibe: "memory", difficulty: 1 },
  { text: "Have you ever built something with your hands?", vibe: "craft", difficulty: 1 },
  { text: "Can you type without looking at the keyboard?", vibe: "skill", difficulty: 1 },

  // ═══════════════════════════════════════════════
  // DAILY LIFE & WELLNESS (25 questions)
  // ═══════════════════════════════════════════════
  { text: "Did you drink enough water today?", vibe: "health", difficulty: 1 },
  { text: "Have you stretched your body?", vibe: "health", difficulty: 1 },
  { text: "Did you get some fresh air?", vibe: "nature", difficulty: 1 },
  { text: "Have you taken a deep breath on purpose?", vibe: "mindfulness", difficulty: 1 },
  { text: "Did you put your phone down for an hour?", vibe: "balance", difficulty: 2 },
  { text: "Have you done something just for yourself?", vibe: "selfcare", difficulty: 2 },
  { text: "Did you go to bed at a reasonable time?", vibe: "discipline", difficulty: 2 },
  { text: "Have you moved your body today?", vibe: "health", difficulty: 1 },
  { text: "Did you eat a vegetable?", vibe: "nourishment", difficulty: 1 },
  { text: "Have you looked up from your screen at the sky?", vibe: "nature", difficulty: 1 },
  { text: "Did you wake up feeling rested?", vibe: "rest", difficulty: 1 },
  { text: "Have you taken a walk outside today?", vibe: "nature", difficulty: 1 },
  { text: "Did you eat a home-cooked meal?", vibe: "nourishment", difficulty: 1 },
  { text: "Have you said no to something that drains you?", vibe: "boundaries", difficulty: 2 },
  { text: "Did you spend less than an hour on social media?", vibe: "balance", difficulty: 2 },
  { text: "Have you cleaned or organized a space today?", vibe: "discipline", difficulty: 1 },
  { text: "Did you take your medication or vitamins?", vibe: "health", difficulty: 1 },
  { text: "Have you listened to your body's signals?", vibe: "mindfulness", difficulty: 2 },
  { text: "Did you do something that made you feel strong?", vibe: "strength", difficulty: 2 },
  { text: "Have you journaled or reflected in writing?", vibe: "reflection", difficulty: 2 },
  { text: "Did you avoid comparing yourself to others today?", vibe: "honesty", difficulty: 3 },
  { text: "Have you created something today?", vibe: "creation", difficulty: 2 },
  { text: "Did you rest without guilt?", vibe: "rest", difficulty: 2 },
  { text: "Have you spent time in nature this week?", vibe: "nature", difficulty: 1 },
  { text: "Did you set a healthy boundary today?", vibe: "boundaries", difficulty: 3 },

  // ═══════════════════════════════════════════════
  // CREATIVITY & DREAMS (25 questions)
  // ═══════════════════════════════════════════════
  { text: "Did you have a vivid dream last night?", vibe: "dreams", difficulty: 1 },
  { text: "Have you written something creative recently?", vibe: "creation", difficulty: 2 },
  { text: "Did you make something with your hands today?", vibe: "craft", difficulty: 2 },
  { text: "Have you had a new idea that excited you?", vibe: "inspiration", difficulty: 1 },
  { text: "Did you daydream today?", vibe: "imagination", difficulty: 1 },
  { text: "Have you tried a new creative medium?", vibe: "experimentation", difficulty: 2 },
  { text: "Did you take a photo that tells a story?", vibe: "expression", difficulty: 2 },
  { text: "Have you been inspired by something unexpected?", vibe: "inspiration", difficulty: 1 },
  { text: "Did you solve a problem in a creative way?", vibe: "resourcefulness", difficulty: 2 },
  { text: "Have you shared your creative work with someone?", vibe: "vulnerability", difficulty: 3 },
  { text: "Did you play music or make a sound today?", vibe: "expression", difficulty: 1 },
  { text: "Have you reimagined something ordinary?", vibe: "imagination", difficulty: 2 },
  { text: "Did you let yourself be a beginner at something?", vibe: "humility", difficulty: 2 },
  { text: "Have you written down a dream or idea?", vibe: "dreams", difficulty: 1 },
  { text: "Did you color, paint, or sketch today?", vibe: "creation", difficulty: 1 },
  { text: "Have you arranged something beautifully?", vibe: "beauty", difficulty: 1 },
  { text: "Did you make up a story or scenario?", vibe: "imagination", difficulty: 1 },
  { text: "Have you experimented in the kitchen?", vibe: "experimentation", difficulty: 1 },
  { text: "Did you see art that moved you?", vibe: "resonance", difficulty: 1 },
  { text: "Have you imagined your ideal day in detail?", vibe: "dreams", difficulty: 2 },
  { text: "Did you express yourself in a new way?", vibe: "expression", difficulty: 2 },
  { text: "Have you built or fixed something recently?", vibe: "craft", difficulty: 2 },
  { text: "Did you find beauty in something broken?", vibe: "wonder", difficulty: 2 },
  { text: "Have you thought about what you'd create with unlimited time?", vibe: "imagination", difficulty: 2 },
  { text: "Did creativity bring you joy today?", vibe: "joy", difficulty: 1 },

  // ═══════════════════════════════════════════════
  // GROWTH & AMBITION (25 questions)
  // ═══════════════════════════════════════════════
  { text: "Did you learn something new today?", vibe: "learning", difficulty: 1 },
  { text: "Have you taken a step toward a goal this week?", vibe: "ambition", difficulty: 2 },
  { text: "Did you step outside your comfort zone?", vibe: "fear", difficulty: 2 },
  { text: "Have you asked for feedback recently?", vibe: "feedback", difficulty: 2 },
  { text: "Did you fail at something and try again?", vibe: "grit", difficulty: 3 },
  { text: "Have you read something that challenged your thinking?", vibe: "curiosity", difficulty: 2 },
  { text: "Did you practice a skill you're developing?", vibe: "discipline", difficulty: 2 },
  { text: "Have you invested in your future self?", vibe: "ambition", difficulty: 2 },
  { text: "Did you have a productive day?", vibe: "discipline", difficulty: 1 },
  { text: "Have you mentored or taught someone?", vibe: "generosity", difficulty: 2 },
  { text: "Did you start something you've been putting off?", vibe: "grit", difficulty: 3 },
  { text: "Have you celebrated a small win?", vibe: "gratitude", difficulty: 1 },
  { text: "Did you choose progress over perfection?", vibe: "progress", difficulty: 2 },
  { text: "Have you written down your goals?", vibe: "intention", difficulty: 2 },
  { text: "Did you resist the urge to quit something hard?", vibe: "persistence", difficulty: 3 },
  { text: "Have you changed your mind about something important?", vibe: "honesty", difficulty: 3 },
  { text: "Did you prioritize what matters over what's urgent?", vibe: "priority", difficulty: 2 },
  { text: "Have you sought out a new perspective?", vibe: "curiosity", difficulty: 2 },
  { text: "Did you show up for yourself today?", vibe: "discipline", difficulty: 2 },
  { text: "Have you been patient with your own progress?", vibe: "patience", difficulty: 2 },
  { text: "Did you make a decision you'd been avoiding?", vibe: "decision", difficulty: 3 },
  { text: "Have you thought about your purpose lately?", vibe: "purpose", difficulty: 3 },
  { text: "Did you do the hard thing instead of the easy thing?", vibe: "grit", difficulty: 3 },
  { text: "Have you acknowledged how far you've come?", vibe: "gratitude", difficulty: 2 },
  { text: "Did you invest time in something meaningful today?", vibe: "purpose", difficulty: 2 },
];

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
