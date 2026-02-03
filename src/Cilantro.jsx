import React, { useState, useEffect } from 'react';

// Enhanced questions with hashtags, fine print, media, and clearer wording
const questions = [
  // Deep & Reflective
  {
    text: "Did you feel at peace at any moment today?",
    type: "reflection",
    difficulty: 2,
    hashtags: ["#peace", "#mindfulness", "#daily"],
    finePrint: "Peace doesn't mean the absence of chaos—it's finding calm within it. Even a brief moment counts.",
    finePrintLinks: [
      { label: "What is inner peace?", url: "https://www.psychologytoday.com/us/basics/inner-peace" }
    ]
  },
  {
    text: "Are you proud of who you're becoming?",
    type: "identity",
    difficulty: 3,
    hashtags: ["#growth", "#identity", "#self"],
    finePrint: "This isn't about perfection—it's about direction. Are you moving toward the person you want to be?",
  },
  {
    text: "Did you listen to your gut feeling about something this week?",
    type: "reflection",
    difficulty: 2,
    hashtags: ["#intuition", "#trust", "#decisions"],
    finePrint: "Intuition is your brain processing information faster than your conscious mind. It's worth listening to.",
    finePrintLinks: [
      { label: "The science of gut feelings", url: "https://www.scientificamerican.com/article/gut-feelings-the-second-brain-in-our-gastrointestinal-systems-excerpt/" }
    ]
  },
  {
    text: "Is there something you need to forgive yourself for?",
    type: "healing",
    difficulty: 3,
    hashtags: ["#forgiveness", "#healing", "#self-compassion"],
    finePrint: "Self-forgiveness isn't about excusing behavior—it's about releasing the weight so you can move forward.",
  },
  {
    text: "Have you been fully honest with yourself this week?",
    type: "honesty",
    difficulty: 3,
    hashtags: ["#honesty", "#truth", "#self-awareness"],
  },
  {
    text: "Did you make time for silence today?",
    type: "wellness",
    difficulty: 1,
    hashtags: ["#silence", "#peace", "#daily"],
    finePrint: "Even 5 minutes of intentional silence can reduce cortisol levels and improve focus.",
  },
  {
    text: "Are you holding onto something you know you should let go of?",
    type: "healing",
    difficulty: 3,
    hashtags: ["#letting-go", "#healing", "#growth"],
  },
  {
    text: "Did you notice something small to be grateful for today?",
    type: "gratitude",
    difficulty: 1,
    hashtags: ["#gratitude", "#mindfulness", "#daily"],
  },
  {
    text: "Are you where you thought you'd be at this point in your life?",
    type: "reflection",
    difficulty: 3,
    hashtags: ["#life-path", "#expectations", "#identity"],
    finePrint: "There's no 'right' timeline. This question is about awareness, not judgment.",
  },
  {
    text: "Did you choose kindness over being right in a conversation this week?",
    type: "relationships",
    difficulty: 2,
    hashtags: ["#kindness", "#relationships", "#growth"],
  },
  {
    text: "Does your heart feel lighter than it did yesterday?",
    type: "emotional",
    difficulty: 2,
    hashtags: ["#emotions", "#healing", "#daily"],
  },
  {
    text: "Did you do something that scared you this month?",
    type: "courage",
    difficulty: 2,
    hashtags: ["#courage", "#fear", "#growth"],
    finePrint: "Courage isn't the absence of fear—it's action despite fear.",
  },

  // Light-hearted & Fun
  {
    text: "Did you laugh out loud today?",
    type: "joy",
    difficulty: 1,
    hashtags: ["#joy", "#laughter", "#daily"],
  },
  {
    text: "Have you danced—even just a little—when nobody was watching this week?",
    type: "joy",
    difficulty: 1,
    hashtags: ["#joy", "#freedom", "#expression"],
  },
  {
    text: "Did you eat something truly delicious today?",
    type: "pleasure",
    difficulty: 1,
    hashtags: ["#food", "#pleasure", "#daily"],
  },
  {
    text: "Have you taken a really satisfying nap this week?",
    type: "rest",
    difficulty: 1,
    hashtags: ["#rest", "#self-care", "#wellness"],
  },
  {
    text: "Did you sing along to a song today?",
    type: "joy",
    difficulty: 1,
    hashtags: ["#music", "#joy", "#expression"],
  },
  {
    text: "Have you worn an outfit that made you feel good this week?",
    type: "confidence",
    difficulty: 1,
    hashtags: ["#confidence", "#self-expression", "#style"],
  },
  {
    text: "Did you pet a dog, cat, or any animal today?",
    type: "connection",
    difficulty: 1,
    hashtags: ["#animals", "#comfort", "#daily"],
  },
  {
    text: "Have you watched the clouds or stars recently?",
    type: "presence",
    difficulty: 1,
    hashtags: ["#nature", "#presence", "#wonder"],
  },
  {
    text: "Did you treat yourself to something nice this week?",
    type: "self-care",
    difficulty: 1,
    hashtags: ["#self-care", "#joy", "#treats"],
  },
  {
    text: "Have you had a lazy day with zero guilt this month?",
    type: "rest",
    difficulty: 1,
    hashtags: ["#rest", "#guilt-free", "#self-care"],
  },

  // Social & Relationships
  {
    text: "Did you tell someone you appreciate them this week?",
    type: "connection",
    difficulty: 2,
    hashtags: ["#appreciation", "#relationships", "#connection"],
  },
  {
    text: "Have you called a friend just to chat (not text) this month?",
    type: "connection",
    difficulty: 1,
    hashtags: ["#friendship", "#connection", "#communication"],
  },
  {
    text: "Did you make someone smile today?",
    type: "kindness",
    difficulty: 1,
    hashtags: ["#kindness", "#connection", "#daily"],
  },
  {
    text: "Have you hugged someone you love this week?",
    type: "intimacy",
    difficulty: 1,
    hashtags: ["#love", "#physical-touch", "#connection"],
  },
  {
    text: "Did you really listen—without planning your response—when someone talked to you today?",
    type: "presence",
    difficulty: 2,
    hashtags: ["#listening", "#presence", "#relationships"],
    finePrint: "Active listening means being fully present, not just waiting for your turn to speak.",
  },
  {
    text: "Have you reconnected with an old friend this year?",
    type: "friendship",
    difficulty: 2,
    hashtags: ["#friendship", "#reconnection", "#nostalgia"],
  },
  {
    text: "Did you ask someone 'how are you really doing?' this week?",
    type: "empathy",
    difficulty: 2,
    hashtags: ["#empathy", "#depth", "#connection"],
  },
  {
    text: "Have you shared a meal with someone you care about this week?",
    type: "bonding",
    difficulty: 1,
    hashtags: ["#meals", "#bonding", "#quality-time"],
  },

  // Pop Culture & Recognition (with images)
  {
    text: "Do you recognize this person?",
    type: "recognition",
    difficulty: 1,
    hashtags: ["#pop-culture", "#recognition", "#icons"],
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/N.Tesla.JPG/440px-N.Tesla.JPG",
    mediaType: "image",
    finePrint: "Nikola Tesla (1856-1943) was a Serbian-American inventor, best known for his contributions to alternating current (AC) electricity.",
  },
  {
    text: "Do you recognize this landmark?",
    type: "recognition",
    difficulty: 1,
    hashtags: ["#travel", "#landmarks", "#world"],
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/440px-Empire_State_Building_%28aerial_view%29.jpg",
    mediaType: "image",
    finePrint: "The Empire State Building in New York City, completed in 1931, was the world's tallest building for nearly 40 years.",
  },
  {
    text: "Have you seen this movie?",
    type: "entertainment",
    difficulty: 1,
    hashtags: ["#movies", "#classics", "#entertainment"],
    mediaUrl: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
    mediaType: "image",
    finePrint: "The Shawshank Redemption (1994), based on a Stephen King novella, is consistently rated as one of the greatest films ever made.",
  },
  {
    text: "Do you recognize this album cover?",
    type: "recognition",
    difficulty: 2,
    hashtags: ["#music", "#albums", "#iconic"],
    mediaUrl: "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg",
    mediaType: "image",
    finePrint: "Abbey Road by The Beatles (1969) - the iconic crosswalk on Abbey Road in London has become a tourist landmark.",
  },
  {
    text: "Do you know all the words to at least one Taylor Swift song?",
    type: "entertainment",
    difficulty: 1,
    hashtags: ["#music", "#taylor-swift", "#pop-culture"],
  },
  {
    text: "Have you cried during an animated movie?",
    type: "emotional",
    difficulty: 1,
    hashtags: ["#movies", "#emotions", "#animation"],
  },
  {
    text: "Did you rewatch a comfort show this month?",
    type: "comfort",
    difficulty: 1,
    hashtags: ["#tv-shows", "#comfort", "#nostalgia"],
  },

  // Knowledge & Skills
  {
    text: "Can you name all the planets in our solar system in order?",
    type: "knowledge",
    difficulty: 2,
    hashtags: ["#space", "#knowledge", "#science"],
    finePrint: "Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune. (Pluto was reclassified as a dwarf planet in 2006.)",
  },
  {
    text: "Do you know your blood type?",
    type: "self-knowledge",
    difficulty: 1,
    hashtags: ["#health", "#self-knowledge", "#practical"],
  },
  {
    text: "Have you ever seen a shooting star?",
    type: "experience",
    difficulty: 1,
    hashtags: ["#nature", "#wonder", "#memories"],
  },
  {
    text: "Can you cook a full meal without looking at a recipe?",
    type: "skills",
    difficulty: 1,
    hashtags: ["#cooking", "#skills", "#independence"],
  },
  {
    text: "Do you know how to read a physical map without GPS?",
    type: "skills",
    difficulty: 2,
    hashtags: ["#navigation", "#skills", "#practical"],
  },
  {
    text: "Have you ever grown a plant from a seed?",
    type: "experience",
    difficulty: 1,
    hashtags: ["#gardening", "#patience", "#nature"],
  },
  {
    text: "Can you identify at least one constellation in the night sky?",
    type: "knowledge",
    difficulty: 2,
    hashtags: ["#astronomy", "#nature", "#knowledge"],
  },

  // Wellness & Daily Life
  {
    text: "Did you drink at least 8 glasses of water today?",
    type: "wellness",
    difficulty: 1,
    hashtags: ["#hydration", "#health", "#daily"],
  },
  {
    text: "Have you stretched your body today?",
    type: "wellness",
    difficulty: 1,
    hashtags: ["#movement", "#wellness", "#daily"],
  },
  {
    text: "Did you get at least 15 minutes of fresh air today?",
    type: "wellness",
    difficulty: 1,
    hashtags: ["#nature", "#wellness", "#daily"],
  },
  {
    text: "Have you taken a deep breath on purpose today?",
    type: "mindfulness",
    difficulty: 1,
    hashtags: ["#breathing", "#mindfulness", "#daily"],
    finePrint: "Intentional deep breathing activates your parasympathetic nervous system, reducing stress.",
  },
  {
    text: "Did you put your phone down for at least an hour today (while awake)?",
    type: "digital-wellness",
    difficulty: 2,
    hashtags: ["#digital-detox", "#presence", "#wellness"],
  },
  {
    text: "Did you go to bed at your intended time last night?",
    type: "habits",
    difficulty: 2,
    hashtags: ["#sleep", "#habits", "#wellness"],
  },
  {
    text: "Have you eaten a fruit or vegetable today?",
    type: "nutrition",
    difficulty: 1,
    hashtags: ["#nutrition", "#health", "#daily"],
  },
  {
    text: "Did you move your body for at least 20 minutes today?",
    type: "movement",
    difficulty: 1,
    hashtags: ["#exercise", "#movement", "#daily"],
  },
];

// Question types - open-ended, just for color coding
const typeColors = {
  reflection: '#8B9DC3',
  identity: '#9F7AEA',
  healing: '#F2B5D4',
  honesty: '#718096',
  wellness: '#68D391',
  gratitude: '#F6E05E',
  emotional: '#FC8181',
  courage: '#F6AD55',
  joy: '#FBD38D',
  pleasure: '#FED7E2',
  rest: '#C4B5FD',
  confidence: '#FBBF24',
  connection: '#F9A8D4',
  presence: '#A7F3D0',
  kindness: '#FCA5A5',
  intimacy: '#DDD6FE',
  friendship: '#93C5FD',
  empathy: '#A5B4FC',
  bonding: '#FDBA74',
  recognition: '#C9B1FF',
  entertainment: '#A78BFA',
  comfort: '#D8B4FE',
  knowledge: '#98D8C8',
  'self-knowledge': '#6EE7B7',
  experience: '#67E8F9',
  skills: '#5EEAD4',
  mindfulness: '#BEF264',
  'digital-wellness': '#A3E635',
  habits: '#84CC16',
  nutrition: '#4ADE80',
  movement: '#34D399',
  relationships: '#F472B6',
  'self-care': '#E879F9',
  default: '#CBD5E0'
};

// Gardens - themed question collections
const gardens = [
  {
    id: 'sparks',
    name: 'Sparks',
    description: 'Joy, passion, and what lights you up',
    icon: '✨',
    color: '#ECC94B',
    gradient: 'from-yellow-400 to-orange-500',
    seedCost: 0, // FREE
    tier: 1,
    size: 'small',
    category: 'joy',
    popularity: 312,
    questions: [
      { text: "Do you remember the last time you felt pure joy?", difficulty: 1 },
      { text: "Is there something that makes you lose track of time?", difficulty: 2 },
      { text: "Have you laughed until you cried recently?", difficulty: 1 },
      { text: "Do you still get excited about things?", difficulty: 2 },
      { text: "Is there a passion you've abandoned that you miss?", difficulty: 2 },
      { text: "When did you last do something just for fun?", difficulty: 1 },
      { text: "Do you let yourself be silly sometimes?", difficulty: 1 },
      { text: "Is there something you've always wanted to try?", difficulty: 2 },
      { text: "Do you celebrate your small wins?", difficulty: 2 },
      { text: "Have you felt truly alive this week?", difficulty: 2 }
    ]
  },
  {
    id: 'bonds',
    name: 'Bonds',
    description: 'Love, friendship, and human connection',
    icon: '💞',
    color: '#ED64A6',
    gradient: 'from-pink-400 to-pink-600',
    seedCost: 0, // FREE
    tier: 2,
    size: 'medium',
    category: 'relationships',
    popularity: 267,
    questions: [
      { text: "Do you have someone you can call at 3am?", difficulty: 2 },
      { text: "Have you told someone you love them recently?", difficulty: 1 },
      { text: "Is there a relationship you've neglected?", difficulty: 2 },
      { text: "Do you let people truly know you?", difficulty: 3 },
      { text: "Have you forgiven someone who hurt you?", difficulty: 3 },
      { text: "Are you a good friend to others?", difficulty: 2 },
      { text: "Do you have healthy boundaries in your relationships?", difficulty: 2 },
      { text: "Is there someone you owe an apology?", difficulty: 2 },
      { text: "Have you been fully present with someone you love recently?", difficulty: 2 },
      { text: "Do you accept love as easily as you give it?", difficulty: 3 }
    ]
  },
  {
    id: 'mirrors',
    name: 'Mirrors',
    description: 'Honest reflections on who you really are',
    icon: '🪞',
    color: '#718096',
    gradient: 'from-gray-500 to-gray-700',
    seedCost: 150,
    tier: 2,
    size: 'medium',
    category: 'self-discovery',
    popularity: 156,
    questions: [
      { text: "Would you want to be friends with yourself?", difficulty: 2 },
      { text: "Do the people closest to you know the real you?", difficulty: 2 },
      { text: "Are you living your life or someone else's expectations?", difficulty: 3 },
      { text: "If you met yourself as a stranger, would you trust you?", difficulty: 2 },
      { text: "Are your stated values actually reflected in your daily actions?", difficulty: 3 },
      { text: "Do you like who you become when you're completely alone?", difficulty: 2 },
      { text: "Are you the same person in private as you are in public?", difficulty: 2 },
      { text: "Would your 10-year-old self be disappointed in you?", difficulty: 3 },
      { text: "Are you genuinely kind when no one is watching?", difficulty: 2 },
      { text: "In your relationships, do you take more than you give?", difficulty: 2 }
    ]
  },
  {
    id: 'crossroads',
    name: 'Crossroads',
    description: 'Life decisions, paths not taken, and regrets',
    icon: '⚖️',
    color: '#9F7AEA',
    gradient: 'from-purple-500 to-purple-700',
    seedCost: 200,
    tier: 2,
    size: 'medium',
    category: 'life-decisions',
    popularity: 124,
    questions: [
      { text: "Is there a major decision you've been avoiding?", difficulty: 2 },
      { text: "Are you staying somewhere out of fear rather than love?", difficulty: 3 },
      { text: "Have you given up on an important dream too easily?", difficulty: 3 },
      { text: "Is your career fulfilling your soul or just paying bills?", difficulty: 3 },
      { text: "Is there someone in your life you should let go of?", difficulty: 3 },
      { text: "Are you choosing comfort over growth?", difficulty: 2 },
      { text: "If you could start over, would you make the same major choices?", difficulty: 3 },
      { text: "Are you waiting for permission to live your own life?", difficulty: 2 },
      { text: "Is fear the one making your important decisions?", difficulty: 2 },
      { text: "Are you settling for less than you deserve?", difficulty: 2 }
    ]
  },
  {
    id: 'roots',
    name: 'Roots',
    description: 'Family, origin, and where you belong',
    icon: '🌳',
    color: '#48BB78',
    gradient: 'from-green-500 to-green-700',
    seedCost: 200,
    tier: 2,
    size: 'small',
    category: 'origins',
    popularity: 98,
    questions: [
      { text: "Have you fully forgiven your parents for their mistakes?", difficulty: 3 },
      { text: "Are you repeating patterns you learned in childhood?", difficulty: 3 },
      { text: "Do you feel like you truly belong somewhere?", difficulty: 2 },
      { text: "Are there family wounds you haven't begun to heal?", difficulty: 3 },
      { text: "Do you carry guilt or shame that isn't yours to carry?", difficulty: 3 },
      { text: "Have you become what your family expected of you?", difficulty: 2 },
      { text: "Is there a conversation with family you need to have?", difficulty: 2 },
      { text: "Do you know and understand where you come from?", difficulty: 1 },
      { text: "Are you running toward something or away from your past?", difficulty: 3 },
      { text: "Have you made peace with your upbringing?", difficulty: 3 }
    ]
  },
  {
    id: 'shadows',
    name: 'Shadows',
    description: 'The parts of yourself you avoid looking at',
    icon: '🌑',
    color: '#4A5568',
    gradient: 'from-gray-700 to-gray-900',
    seedCost: 300,
    tier: 3,
    size: 'large',
    category: 'deep-dive',
    popularity: 89,
    questions: [
      { text: "Are you running from something you know you should face?", difficulty: 3 },
      { text: "Do you judge others for traits you secretly see in yourself?", difficulty: 3 },
      { text: "Have you been lying to yourself about something important?", difficulty: 3 },
      { text: "Is there a part of yourself you're genuinely ashamed of?", difficulty: 3 },
      { text: "Could you be the villain in someone else's story?", difficulty: 3 },
      { text: "Do you self-sabotage when things start going well?", difficulty: 3 },
      { text: "Is there something you're addicted to that you won't admit?", difficulty: 3 },
      { text: "Have you hurt someone and never apologized?", difficulty: 3 },
      { text: "Do you sometimes feel satisfaction when others fail?", difficulty: 3 },
      { text: "Are you pretending to be someone you're not?", difficulty: 3 }
    ]
  },
  {
    id: 'depths',
    name: 'Depths',
    description: 'Mortality, meaning, and big questions',
    icon: '🌊',
    color: '#4299E1',
    gradient: 'from-blue-500 to-blue-700',
    seedCost: 400,
    tier: 3,
    size: 'large',
    category: 'existential',
    popularity: 201,
    questions: [
      { text: "Are you genuinely afraid of dying?", difficulty: 3 },
      { text: "Do you know what you're living for?", difficulty: 3 },
      { text: "Would your life have meaning if no one remembered you after?", difficulty: 3 },
      { text: "Have you truly accepted that you won't live forever?", difficulty: 3 },
      { text: "Are you at peace with not having all the answers?", difficulty: 3 },
      { text: "Do you believe you matter in the grand scheme of things?", difficulty: 3 },
      { text: "Have you found something worth suffering for?", difficulty: 3 },
      { text: "Do you feel like you're running out of time for what matters most?", difficulty: 3 },
      { text: "Do you know what you'd regret most on your deathbed?", difficulty: 3 },
      { text: "Have you truly lived, or have you mostly just existed?", difficulty: 3 }
    ]
  }
];

// Garden categories
const gardenCategories = [
  { id: 'popular', name: 'Most Popular', icon: '🔥' },
  { id: 'free', name: 'Free Gardens', icon: '🎁' },
  { id: 'deep-dive', name: 'Deep Dives', icon: '🌊' },
  { id: 'self-discovery', name: 'Self Discovery', icon: '🔮' },
  { id: 'relationships', name: 'Relationships', icon: '💕' },
  { id: 'joy', name: 'Joy & Light', icon: '✨' },
];

// Format timestamp
const formatTime = (isoString) => {
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

// Generate consistent Daily 30 questions
const getDailyQuestions = () => {
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

// CSV Export helper
const exportToCSV = (answers) => {
  const headers = ['Question', 'Answer', 'Type', 'Date', 'Time'];
  const rows = answers.map(a => [
    `"${a.text.replace(/"/g, '""')}"`,
    a.answer,
    a.type || 'general',
    new Date(a.timestamp).toLocaleDateString(),
    new Date(a.timestamp).toLocaleTimeString()
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cilantro-reflections-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

// Get stats helper
const getStats = (answers) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    allTime: answers.length,
    today: answers.filter(a => new Date(a.timestamp) >= today).length,
    thisWeek: answers.filter(a => new Date(a.timestamp) >= weekAgo).length
  };
};

export default function Cilantro() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFinePrint, setShowFinePrint] = useState(false);

  // Navigation state
  const [currentView, setCurrentView] = useState('landing');
  const [selectedGarden, setSelectedGarden] = useState(null);
  const [gardenQuestionIndex, setGardenQuestionIndex] = useState(0);
  const [gardenCategory, setGardenCategory] = useState('popular');

  // Daily 30 tracking
  const [dailyQuestions] = useState(getDailyQuestions());
  const [dailyQuestionIndex, setDailyQuestionIndex] = useState(0);
  const [dailyAnswered, setDailyAnswered] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(3);
  const [showDailyReading, setShowDailyReading] = useState(false);

  // Seeds economy
  const [seeds, setSeeds] = useState(50);
  const [gardenUnlocks, setGardenUnlocks] = useState({ sparks: true, bonds: true }); // Free gardens start unlocked
  const [seedAnimation, setSeedAnimation] = useState(null);

  // Sidebar state
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('settings');

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState('welcome');
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  // Garden progress tracking
  const [gardenProgress, setGardenProgress] = useState({});

  // Get answered count for a garden
  const getGardenAnsweredCount = (gardenId) => {
    return answers.filter(a => a.gardenId === gardenId).length;
  };

  // Earn seeds
  const earnSeeds = (difficulty) => {
    const earned = difficulty || 1;
    setSeeds(prev => prev + earned);
    setSeedAnimation(`+${earned}`);
    setTimeout(() => setSeedAnimation(null), 1500);
  };

  // Get a random unused question
  const getNewQuestion = () => {
    let available = questions.filter((_, i) => !usedQuestions.includes(i));
    if (available.length === 0) {
      setUsedQuestions([]);
      available = questions;
    }
    const randomIndex = Math.floor(Math.random() * available.length);
    const questionIndex = questions.indexOf(available[randomIndex]);
    setUsedQuestions(prev => [...prev, questionIndex]);
    return available[randomIndex];
  };

  useEffect(() => {
    if (currentView === 'home' && !currentQuestion) {
      setCurrentQuestion(getNewQuestion());
    }
  }, [currentView]);

  const handleAnswer = (answer) => {
    setIsTransitioning(true);
    earnSeeds(currentQuestion.difficulty);
    setShowFinePrint(false);

    setAnswers(prev => [...prev, {
      ...currentQuestion,
      answer,
      timestamp: new Date().toISOString()
    }]);

    setTimeout(() => {
      setCurrentQuestion(getNewQuestion());
      setIsTransitioning(false);
    }, 400);
  };

  const handleSkip = () => {
    setIsTransitioning(true);
    setShowFinePrint(false);
    setSkippedQuestions(prev => [...prev, currentQuestion]);
    setTimeout(() => {
      setCurrentQuestion(getNewQuestion());
      setIsTransitioning(false);
    }, 300);
  };

  // Garden handlers
  const isGardenUnlocked = (gardenId) => {
    const garden = gardens.find(g => g.id === gardenId);
    return garden?.seedCost === 0 || gardenUnlocks[gardenId] === true;
  };

  const unlockGarden = (garden) => {
    if (garden.seedCost === 0) {
      setGardenUnlocks(prev => ({ ...prev, [garden.id]: true }));
      return;
    }
    if (seeds < garden.seedCost) {
      setSeedAnimation('Not enough seeds!');
      setTimeout(() => setSeedAnimation(null), 1500);
      return;
    }
    setSeeds(prev => prev - garden.seedCost);
    setGardenUnlocks(prev => ({ ...prev, [garden.id]: true }));
    setSeedAnimation(`-${garden.seedCost} 🔓`);
    setTimeout(() => setSeedAnimation(null), 1500);
  };

  const openGarden = (garden) => {
    if (!isGardenUnlocked(garden.id)) return;
    setSelectedGarden(garden);
    setGardenQuestionIndex(0);
    setCurrentView('garden-detail');
  };

  const handleGardenAnswer = (answer) => {
    setIsTransitioning(true);
    const currentQ = selectedGarden.questions[gardenQuestionIndex];
    earnSeeds(currentQ.difficulty);

    setAnswers(prev => [...prev, {
      text: currentQ.text,
      type: 'garden',
      difficulty: currentQ.difficulty,
      gardenId: selectedGarden.id,
      gardenName: selectedGarden.name,
      answer,
      timestamp: new Date().toISOString()
    }]);

    setTimeout(() => {
      if (gardenQuestionIndex < selectedGarden.questions.length - 1) {
        setGardenQuestionIndex(prev => prev + 1);
      } else {
        const totalDifficulty = selectedGarden.questions.reduce((sum, q) => sum + q.difficulty, 0);
        const bonus = totalDifficulty * 2;
        setSeeds(prev => prev + bonus);
        setSeedAnimation(`+${bonus} bonus!`);
        setTimeout(() => setSeedAnimation(null), 2000);
        setCurrentView('gardens');
        setSelectedGarden(null);
      }
      setIsTransitioning(false);
    }, 400);
  };

  const skipGardenQuestion = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (gardenQuestionIndex < selectedGarden.questions.length - 1) {
        setGardenQuestionIndex(prev => prev + 1);
      } else {
        setCurrentView('gardens');
        setSelectedGarden(null);
      }
      setIsTransitioning(false);
    }, 300);
  };

  // Daily 30 handlers
  const startDaily30 = () => {
    setDailyQuestionIndex(0);
    setShowProfile(false);
    setCurrentView('daily30');
  };

  const handleDaily30Answer = (answer) => {
    setIsTransitioning(true);
    const currentQ = dailyQuestions[dailyQuestionIndex];
    earnSeeds(currentQ.difficulty);
    setShowFinePrint(false);

    setAnswers(prev => [...prev, {
      ...currentQ,
      type: 'daily30',
      answer,
      timestamp: new Date().toISOString()
    }]);

    setDailyAnswered(prev => prev + 1);

    setTimeout(() => {
      if (dailyQuestionIndex < 29) {
        setDailyQuestionIndex(prev => prev + 1);
      } else {
        const streakBonus = 30 + (dailyStreak * 5);
        setSeeds(prev => prev + streakBonus);
        setSeedAnimation(`+${streakBonus} Daily 30 complete!`);
        setTimeout(() => setSeedAnimation(null), 2500);
        setShowDailyReading(true);
        setCurrentView('home');
      }
      setIsTransitioning(false);
    }, 400);
  };

  const skipDaily30Question = () => {
    setIsTransitioning(true);
    setShowFinePrint(false);
    setTimeout(() => {
      if (dailyQuestionIndex < 29) {
        setDailyQuestionIndex(prev => prev + 1);
      } else {
        setCurrentView('home');
      }
      setIsTransitioning(false);
    }, 300);
  };

  const changeAnswer = (index) => {
    const CHANGE_COST = 5;
    if (seeds < CHANGE_COST) {
      setSeedAnimation('Not enough seeds!');
      setTimeout(() => setSeedAnimation(null), 1500);
      return;
    }

    setSeeds(prev => prev - CHANGE_COST);
    setSeedAnimation(`-${CHANGE_COST}`);
    setTimeout(() => setSeedAnimation(null), 1500);

    setAnswers(prev => prev.map((a, i) => {
      if (i === index) {
        const newAnswer = a.answer === 'yes' ? 'no' : 'yes';
        const historyEntry = { answer: a.answer, timestamp: a.updatedAt || a.timestamp };
        return {
          ...a,
          answer: newAnswer,
          updatedAt: new Date().toISOString(),
          history: [...(a.history || []), historyEntry]
        };
      }
      return a;
    }));
  };

  // Auth handlers
  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ firstName: username.split('_')[0] || username, username });
    setIsLoggedIn(true);
    setCurrentView('home');
    setCurrentQuestion(getNewQuestion());
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setUser({ firstName, username });
    setIsLoggedIn(true);
    setCurrentView('home');
    setCurrentQuestion(getNewQuestion());
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setAuthView('welcome');
    setCurrentView('landing');
    setFirstName('');
    setUsername('');
    setPassword('');
    setShowSidebar(false);
    setShowProfile(false);
  };

  // ============ PERSISTENT HEADER COMPONENT ============
  const Header = ({ showBack = false, backAction = null, title = null }) => (
    <div className="pt-6 pb-4 px-6">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        {/* Left side - Logo or Back */}
        {showBack ? (
          <button
            onClick={backAction}
            className="text-stone-400 hover:text-stone-600 transition-colors text-sm"
          >
            ← back
          </button>
        ) : (
          <button
            onClick={() => { setCurrentView('home'); setShowProfile(false); }}
            className="text-2xl font-light tracking-wide text-stone-400 hover:text-stone-600 transition-colors"
          >
            cilantro
          </button>
        )}

        {/* Center - Title (optional) */}
        {title && (
          <h1 className="text-lg font-light tracking-wide text-stone-500">{title}</h1>
        )}

        {/* Right side - Nav icons */}
        <div className="flex items-center gap-2">
          {/* Seeds indicator */}
          <div className="flex items-center gap-1 px-2 py-1 bg-white border border-stone-200 rounded-full shadow-sm">
            <span className="text-sm">🌱</span>
            <span className="text-xs font-medium text-stone-500">{seeds}</span>
            {seedAnimation && (
              <span className={`text-xs font-medium ${
                seedAnimation.startsWith('-') || seedAnimation.startsWith('Not') ? 'text-rose-400' : 'text-emerald-500'
              }`}>
                {seedAnimation}
              </span>
            )}
          </div>

          {/* Gardens button */}
          <button
            onClick={() => { setCurrentView('gardens'); setShowProfile(false); }}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors shadow-sm ${
              currentView === 'gardens'
                ? 'bg-stone-700 border-stone-700'
                : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
            title="Gardens"
          >
            <svg className={`w-4 h-4 ${currentView === 'gardens' ? 'text-white' : 'text-stone-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-10a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4z" />
              <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Profile button */}
          <button
            onClick={() => { setShowProfile(true); setCurrentView('home'); }}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors shadow-sm ${
              showProfile
                ? 'bg-stone-700 border-stone-700'
                : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <svg className={`w-4 h-4 ${showProfile ? 'text-white' : 'text-stone-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  // ============ FOOTNOTE SECTION COMPONENT ============
  const FootnoteSection = ({ question }) => (
    <div className="mt-8 px-4">
      <div className="border-t border-stone-200 pt-4">
        {/* Hashtags */}
        {question?.hashtags && (
          <div className="flex justify-center flex-wrap gap-2 mb-3">
            {question.hashtags.map((tag, i) => (
              <span key={i} className="text-xs text-stone-400">{tag}</span>
            ))}
          </div>
        )}

        {/* Fine Print */}
        {question?.finePrint && (
          <div className="text-center">
            <button
              onClick={() => setShowFinePrint(!showFinePrint)}
              className="text-xs text-stone-400 hover:text-stone-500 transition-colors"
            >
              {showFinePrint ? '▼ hide fine print' : '▶ fine print'}
            </button>
            {showFinePrint && (
              <div className="mt-3 p-4 bg-white/50 rounded-xl text-sm text-stone-500 font-light text-left">
                <p>{question.finePrint}</p>
                {question.finePrintLinks && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {question.finePrintLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-600 underline"
                      >
                        {link.label} ↗
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // ============ LANDING PAGE ============
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50 to-stone-100">
        <div className="min-h-screen flex flex-col">
          <nav className="p-6 flex justify-between items-center max-w-4xl mx-auto w-full">
            <h1 className="text-2xl font-light tracking-wide text-stone-500">cilantro</h1>
            <button
              onClick={() => setCurrentView('auth')}
              className="text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              sign in
            </button>
          </nav>

          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="max-w-2xl">
              <div className="flex justify-center gap-2 mb-8">
                {['#8B9DC3', '#B8D4E3', '#F2B5D4', '#C9B1FF', '#98D8C8', '#F7DC6F'].map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full opacity-60 animate-pulse"
                    style={{ backgroundColor: color, animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>

              <h2 className="text-4xl md:text-6xl font-light text-stone-700 mb-6 leading-tight">
                yes or no.<br />
                <span className="text-stone-400">find yourself.</span>
              </h2>

              <p className="text-lg text-stone-500 font-light mb-12 max-w-md mx-auto leading-relaxed">
                Simple questions. Honest answers. A gentle journey of self-discovery, one reflection at a time.
              </p>

              <button
                onClick={() => setCurrentView('auth')}
                className="px-12 py-4 bg-stone-700 hover:bg-stone-800 text-white rounded-full font-light text-lg transition-all shadow-lg hover:shadow-xl"
              >
                begin your journey
              </button>

              <p className="mt-8 text-sm text-stone-400 font-light">
                free forever · no ads · your data stays yours
              </p>
            </div>
          </div>

          <div className="pb-8 flex justify-center">
            <div className="animate-bounce text-stone-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="py-24 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-light text-stone-600 text-center mb-16">how it works</h3>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <span className="text-2xl">💭</span>
                </div>
                <h4 className="font-medium text-stone-700 mb-2">reflect daily</h4>
                <p className="text-sm text-stone-500 font-light">
                  Answer simple yes/no questions that make you think about who you are.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                  <span className="text-2xl">🌱</span>
                </div>
                <h4 className="font-medium text-stone-700 mb-2">grow seeds</h4>
                <p className="text-sm text-stone-500 font-light">
                  Earn seeds with every answer. Use them to unlock themed gardens.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <span className="text-2xl">🔮</span>
                </div>
                <h4 className="font-medium text-stone-700 mb-2">discover yourself</h4>
                <p className="text-sm text-stone-500 font-light">
                  Track your reflections over time. Notice patterns. Embrace growth.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-24 px-6 bg-gradient-to-b from-stone-50 to-stone-100">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-light text-stone-600 mb-4">want to learn more?</h3>
            <p className="text-stone-500 font-light mb-8">
              Follow our journey as we build Cilantro.
            </p>
            <a
              href="https://substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 border border-stone-300 hover:border-stone-400 text-stone-600 rounded-full font-light transition-all"
            >
              read our substack →
            </a>
          </div>
        </div>

        <div className="py-16 px-6 bg-stone-800 text-center">
          <h3 className="text-2xl font-light text-white mb-4">ready to reflect?</h3>
          <button
            onClick={() => setCurrentView('auth')}
            className="px-10 py-3 bg-white hover:bg-stone-100 text-stone-800 rounded-full font-light transition-all"
          >
            get started free
          </button>
          <p className="mt-6 text-stone-500 text-sm font-light">© 2026 Cilantro</p>
        </div>
      </div>
    );
  }

  // ============ AUTH VIEWS ============
  if (currentView === 'auth' || !isLoggedIn) {
    if (authView === 'welcome') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col items-center justify-center px-6 relative">
          <button
            onClick={() => setCurrentView('landing')}
            className="absolute top-6 left-6 text-stone-400 hover:text-stone-600 transition-colors text-sm"
          >
            ← back
          </button>

          <div className="max-w-sm w-full text-center">
            <div className="mb-12">
              <h1 className="text-5xl font-light tracking-wide text-stone-600 mb-3">cilantro</h1>
              <p className="text-stone-400 font-light">yes or no. find yourself.</p>
            </div>

            <div className="flex justify-center gap-2 mb-12">
              {Object.values(typeColors).slice(0, 6).map((color, i) => (
                <div key={i} className="w-2 h-2 rounded-full opacity-40" style={{ backgroundColor: color }} />
              ))}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setAuthView('signup')}
                className="w-full py-4 bg-stone-700 hover:bg-stone-800 text-white rounded-2xl font-light text-lg transition-all shadow-sm"
              >
                get started
              </button>
              <button
                onClick={() => setAuthView('login')}
                className="w-full py-4 bg-white hover:bg-stone-50 border border-stone-200 text-stone-600 rounded-2xl font-light text-lg transition-all"
              >
                sign in
              </button>
            </div>

            <p className="mt-8 text-xs text-stone-300 font-light">reflect. grow. repeat.</p>
          </div>
        </div>
      );
    }

    if (authView === 'login') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col px-6 pt-12">
          <div className="max-w-sm w-full mx-auto">
            <button onClick={() => setAuthView('welcome')} className="text-stone-400 hover:text-stone-600 transition-colors text-sm mb-8">
              ← back
            </button>
            <h2 className="text-3xl font-light text-stone-600 mb-2">welcome back</h2>
            <p className="text-stone-400 font-light mb-8">continue your reflections</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-4 px-4 bg-white border border-stone-200 rounded-2xl text-stone-600 placeholder-stone-300 focus:outline-none focus:border-stone-300 font-light"
                required
              />
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-4 px-4 bg-white border border-stone-200 rounded-2xl text-stone-600 placeholder-stone-300 focus:outline-none focus:border-stone-300 font-light"
                required
              />
              <button type="submit" className="w-full py-4 bg-stone-700 hover:bg-stone-800 text-white rounded-2xl font-light text-lg transition-all shadow-sm mt-6">
                sign in
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-stone-400 font-light">
              don't have an account?{' '}
              <button onClick={() => setAuthView('signup')} className="text-stone-600 hover:text-stone-800 underline">sign up</button>
            </p>
          </div>
        </div>
      );
    }

    if (authView === 'signup') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col px-6 pt-12">
          <div className="max-w-sm w-full mx-auto">
            <button onClick={() => setAuthView('welcome')} className="text-stone-400 hover:text-stone-600 transition-colors text-sm mb-8">
              ← back
            </button>
            <h2 className="text-3xl font-light text-stone-600 mb-2">create account</h2>
            <p className="text-stone-400 font-light mb-8">start your journey of reflection</p>

            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="text"
                placeholder="first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full py-4 px-4 bg-white border border-stone-200 rounded-2xl text-stone-600 placeholder-stone-300 focus:outline-none focus:border-stone-300 font-light"
                required
              />
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-4 px-4 bg-white border border-stone-200 rounded-2xl text-stone-600 placeholder-stone-300 focus:outline-none focus:border-stone-300 font-light"
                required
              />
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-4 px-4 bg-white border border-stone-200 rounded-2xl text-stone-600 placeholder-stone-300 focus:outline-none focus:border-stone-300 font-light"
                required
              />
              <button type="submit" className="w-full py-4 bg-stone-700 hover:bg-stone-800 text-white rounded-2xl font-light text-lg transition-all shadow-sm mt-6">
                create account
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-stone-400 font-light">
              already have an account?{' '}
              <button onClick={() => setAuthView('login')} className="text-stone-600 hover:text-stone-800 underline">sign in</button>
            </p>
          </div>
        </div>
      );
    }
  }

  if (!currentQuestion && currentView === 'home' && !showProfile) return null;

  const stats = getStats(answers);

  // ============ SIDEBAR ============
  const Sidebar = () => (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${showSidebar ? 'visible' : 'invisible'}`}>
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${showSidebar ? 'opacity-30' : 'opacity-0'}`}
        onClick={() => setShowSidebar(false)}
      />
      <div className={`absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl transition-transform duration-300 ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-medium text-stone-700">Menu</h2>
            <button onClick={() => setShowSidebar(false)} className="text-stone-400 hover:text-stone-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            {['settings', 'shop'].map(tab => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={`flex-1 py-2 rounded-xl text-sm font-light transition-all ${
                  sidebarTab === tab ? 'bg-stone-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {sidebarTab === 'settings' && (
            <div className="space-y-4">
              <button className="w-full p-4 text-left bg-stone-50 hover:bg-stone-100 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🔔</span>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Notifications</p>
                    <p className="text-xs text-stone-400">Daily reminders</p>
                  </div>
                </div>
              </button>
              <button className="w-full p-4 text-left bg-stone-50 hover:bg-stone-100 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🌙</span>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Appearance</p>
                    <p className="text-xs text-stone-400">Light mode</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => exportToCSV(answers)}
                className="w-full p-4 text-left bg-stone-50 hover:bg-stone-100 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📥</span>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Export Data</p>
                    <p className="text-xs text-stone-400">Download as CSV</p>
                  </div>
                </div>
              </button>
              <button className="w-full p-4 text-left bg-stone-50 hover:bg-stone-100 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🔒</span>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Privacy</p>
                    <p className="text-xs text-stone-400">Data & security</p>
                  </div>
                </div>
              </button>
              <hr className="border-stone-100 my-4" />
              <button
                onClick={handleLogout}
                className="w-full p-4 text-left hover:bg-rose-50 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">👋</span>
                  <p className="text-sm font-medium text-rose-500">Sign Out</p>
                </div>
              </button>
            </div>
          )}

          {sidebarTab === 'shop' && (
            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl mb-4">
                <span className="text-3xl">🌱</span>
                <p className="text-2xl font-light text-stone-700 mt-2">{seeds}</p>
                <p className="text-xs text-stone-500">current seeds</p>
              </div>
              <p className="text-xs text-stone-400 text-center mb-4">Buy seeds or go unlimited</p>
              <button className="w-full p-4 bg-stone-50 hover:bg-stone-100 rounded-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🌱</span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-stone-700">100 Seeds</p>
                      <p className="text-xs text-stone-400">Unlock a garden</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-stone-600">$0.99</span>
                </div>
              </button>
              <button className="w-full p-4 bg-stone-50 hover:bg-stone-100 rounded-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🌿</span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-stone-700">500 Seeds</p>
                      <p className="text-xs text-stone-400">Best value</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-stone-600">$3.99</span>
                </div>
              </button>
              <div className="relative">
                <div className="absolute -top-2 left-4 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                  Popular
                </div>
                <button className="w-full p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">✨</span>
                      <div className="text-left">
                        <p className="text-sm font-medium text-purple-700">Unlimited</p>
                        <p className="text-xs text-purple-500">All gardens unlocked</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-purple-600">$4.99/mo</span>
                  </div>
                </button>
              </div>
              <p className="text-xs text-stone-400 text-center mt-4">Payments secured by Stripe</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ============ PROFILE VIEW ============
  if (showProfile) {
    const filteredAnswers = searchQuery
      ? answers.filter(a => a.text.toLowerCase().includes(searchQuery.toLowerCase()))
      : answers;

    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col">
        <Sidebar />
        <Header title="profile" />

        <div className="flex-1 px-6 pb-8 overflow-auto">
          <div className="max-w-sm mx-auto">
            {/* Menu button */}
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowSidebar(true)} className="text-stone-400 hover:text-stone-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* User info */}
            {user && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                    <span className="text-stone-500 font-light text-xl">
                      {user.firstName?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-stone-600 font-medium">{user.firstName}</p>
                    <p className="text-xs text-stone-300">@{user.username}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Daily 30 Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-stone-600">Daily 30</h3>
                  <p className="text-xs text-stone-400 mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {dailyStreak > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full">
                    🔥 {dailyStreak} day streak
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                    style={{ width: `${(dailyAnswered / 30) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-stone-400">{dailyAnswered}/30</span>
              </div>
              <button
                onClick={startDaily30}
                className="w-full py-3 bg-stone-700 hover:bg-stone-800 text-white rounded-xl font-light text-sm transition-all"
              >
                {dailyAnswered === 0 ? 'start today\'s daily 30' : dailyAnswered < 30 ? 'continue daily 30' : 'completed ✓'}
              </button>
            </div>

            {/* Daily Reading */}
            {showDailyReading && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-purple-100 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📖</span>
                  <h3 className="text-sm font-medium text-purple-700">Your Daily Reading</h3>
                </div>
                <p className="text-sm text-purple-600 font-light leading-relaxed mb-4">
                  Based on today's reflections, you seem to be in a contemplative space.
                  Remember: the questions you ponder say as much about you as the answers you give.
                </p>
                <p className="text-xs text-purple-400 italic">Full insights coming soon...</p>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
              <h3 className="text-sm text-stone-400 font-light mb-4">your stats</h3>
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-3xl font-light text-stone-700">{stats.allTime}</div>
                  <div className="text-xs text-stone-400 mt-1">all time</div>
                </div>
                <div className="w-px bg-stone-100"></div>
                <div>
                  <div className="text-3xl font-light text-amber-500">{stats.today}</div>
                  <div className="text-xs text-stone-400 mt-1">today</div>
                </div>
                <div className="w-px bg-stone-100"></div>
                <div>
                  <div className="text-3xl font-light text-emerald-500">{stats.thisWeek}</div>
                  <div className="text-xs text-stone-400 mt-1">this week</div>
                </div>
              </div>
            </div>

            {/* Insights placeholder */}
            {answers.length >= 10 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-sm border border-amber-100 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🔍</span>
                  <h3 className="text-sm font-medium text-amber-700">Insights</h3>
                </div>
                <p className="text-sm text-amber-600 font-light leading-relaxed mb-2">
                  We noticed something interesting in your answers...
                </p>
                <p className="text-xs text-amber-400 italic">Pattern detection coming soon.</p>
              </div>
            )}

            {/* Answer Log */}
            {answers.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-stone-400 font-light">your reflections</h3>
                  <button
                    onClick={() => exportToCSV(answers)}
                    className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    export ↓
                  </button>
                </div>

                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="search reflections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 px-3 text-sm bg-stone-50 border border-stone-100 rounded-xl text-stone-600 placeholder-stone-300 focus:outline-none focus:border-stone-200 font-light"
                  />
                </div>

                <div className="space-y-4 max-h-96 overflow-auto">
                  {[...filteredAnswers].reverse().map((a, i) => {
                    const actualIndex = answers.indexOf(a);
                    return (
                      <div key={i} className="border-b border-stone-50 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: typeColors[a.type] || typeColors.default }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-stone-600 font-light leading-relaxed">{a.text}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <button
                                onClick={() => changeAnswer(actualIndex)}
                                className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                                  a.answer === 'yes'
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                                }`}
                              >
                                {a.answer}
                              </button>
                              <span className="text-xs text-stone-300">{formatTime(a.updatedAt || a.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============ GARDENS LIST VIEW ============
  if (currentView === 'gardens') {
    const sortedGardens = [...gardens].sort((a, b) => {
      if (gardenCategory === 'popular') return b.popularity - a.popularity;
      if (gardenCategory === 'free') return a.seedCost - b.seedCost;
      return 0;
    });

    const filteredGardens = gardenCategory === 'popular' || gardenCategory === 'free'
      ? sortedGardens
      : sortedGardens.filter(g => g.category === gardenCategory);

    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col">
        <Header title="gardens" />

        <div className="flex-1 px-6 pb-8 overflow-auto">
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-stone-400 font-light mb-6">explore themed collections</p>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
              {gardenCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setGardenCategory(cat.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-light transition-all ${
                    gardenCategory === cat.id
                      ? 'bg-stone-700 text-white'
                      : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Pinterest-style masonry grid */}
            <div className="columns-2 gap-4 space-y-4">
              {(gardenCategory === 'free'
                ? sortedGardens.filter(g => g.seedCost === 0)
                : filteredGardens
              ).map((garden) => {
                const unlocked = isGardenUnlocked(garden.id);
                const answeredCount = getGardenAnsweredCount(garden.id);
                const heightClass = garden.size === 'large' ? 'h-72' : garden.size === 'medium' ? 'h-56' : 'h-44';

                return (
                  <div
                    key={garden.id}
                    className="break-inside-avoid mb-4 rounded-2xl overflow-hidden shadow-sm border border-stone-100 transition-all hover:shadow-md"
                  >
                    {/* Garden card header - grayscale when locked */}
                    <div
                      className={`${heightClass} bg-gradient-to-br ${garden.gradient} p-5 flex flex-col justify-between relative transition-all duration-300 ${
                        !unlocked ? 'grayscale' : ''
                      }`}
                    >
                      {!unlocked && (
                        <div className="absolute top-3 right-3">
                          <span className="text-2xl">🔒</span>
                        </div>
                      )}

                      <div>
                        <span className="text-3xl mb-2 block">{garden.icon}</span>
                        <h3 className="text-white font-medium text-lg">{garden.name}</h3>
                        <p className="text-white/70 text-xs mt-1">{garden.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-xs">
                          {answeredCount}/{garden.questions.length} answered
                        </span>
                        {!unlocked && garden.seedCost > 0 && (
                          <span className="text-white/80 text-xs flex items-center gap-1">
                            🌱 {garden.seedCost}
                          </span>
                        )}
                        {garden.seedCost === 0 && (
                          <span className="text-white/80 text-xs bg-white/20 px-2 py-0.5 rounded-full">FREE</span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-stone-100">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${(answeredCount / garden.questions.length) * 100}%`,
                          backgroundColor: unlocked ? garden.color : '#CBD5E0'
                        }}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="bg-white p-3">
                      {unlocked ? (
                        <button
                          onClick={() => openGarden(garden)}
                          className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-light transition-all"
                        >
                          {answeredCount === 0 ? 'Start Garden' : answeredCount < garden.questions.length ? 'Continue' : 'Review'}
                        </button>
                      ) : (
                        <button
                          onClick={() => unlockGarden(garden)}
                          className="w-full py-2 bg-stone-700 hover:bg-stone-800 text-white rounded-xl text-sm font-light transition-all flex items-center justify-center gap-2"
                        >
                          <span>🌱</span> Unlock for {garden.seedCost}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ GARDEN DETAIL VIEW ============
  if (currentView === 'garden-detail' && selectedGarden) {
    const currentGardenQuestion = selectedGarden.questions[gardenQuestionIndex];
    const progress = ((gardenQuestionIndex + 1) / selectedGarden.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col">
        <Header />

        <div className="px-6 pb-2">
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => { setCurrentView('gardens'); setSelectedGarden(null); }}
                className="text-stone-400 hover:text-stone-600 transition-colors text-sm"
              >
                ← exit garden
              </button>
              <span className="text-xs text-stone-400">
                {gardenQuestionIndex + 1} / {selectedGarden.questions.length}
              </span>
            </div>
            <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%`, backgroundColor: selectedGarden.color }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="max-w-sm w-full">
            <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
              <div className="flex justify-center mb-6">
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: selectedGarden.color + '20', color: selectedGarden.color }}
                >
                  {selectedGarden.icon} {selectedGarden.name}
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-light text-stone-700 text-center leading-relaxed mb-8 px-4">
                {currentGardenQuestion.text}
              </h2>

              <div className="flex gap-4 px-4">
                <button
                  onClick={() => handleGardenAnswer('yes')}
                  className="flex-1 py-5 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-200 rounded-2xl text-stone-600 hover:text-emerald-600 font-light text-lg transition-all duration-200 shadow-sm hover:shadow"
                >
                  yes
                </button>
                <button
                  onClick={() => handleGardenAnswer('no')}
                  className="flex-1 py-5 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-2xl text-stone-600 hover:text-rose-400 font-light text-lg transition-all duration-200 shadow-sm hover:shadow"
                >
                  no
                </button>
              </div>

              <div className="flex justify-center mt-6">
                <button onClick={skipGardenQuestion} className="text-xs text-stone-300 hover:text-stone-400 transition-colors font-light">
                  skip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ DAILY 30 VIEW ============
  if (currentView === 'daily30') {
    const currentDailyQuestion = dailyQuestions[dailyQuestionIndex];
    const progress = ((dailyQuestionIndex + 1) / 30) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col">
        <Header />

        <div className="px-6 pb-2">
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-2">
              <button onClick={() => setCurrentView('home')} className="text-stone-400 hover:text-stone-600 transition-colors text-sm">
                ← exit
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-stone-600">Daily 30</span>
                {dailyStreak > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">🔥 {dailyStreak}</span>
                )}
              </div>
              <span className="text-xs text-stone-400">{dailyQuestionIndex + 1}/30</span>
            </div>
            <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="max-w-sm w-full">
            <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>

              {/* Media */}
              {currentDailyQuestion?.mediaUrl && (
                <div className="flex justify-center mb-6">
                  <img
                    src={currentDailyQuestion.mediaUrl}
                    alt=""
                    className="max-h-40 rounded-xl shadow-md object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Type indicator */}
              <div className="flex justify-center mb-4">
                <div
                  className="w-2 h-2 rounded-full opacity-60"
                  style={{ backgroundColor: typeColors[currentDailyQuestion?.type] || typeColors.default }}
                />
              </div>

              {/* Question */}
              <h2 className="text-2xl md:text-3xl font-light text-stone-700 text-center leading-relaxed mb-8 px-4">
                {currentDailyQuestion?.text}
              </h2>

              {/* Yes/No buttons */}
              <div className="flex gap-4 px-4">
                <button
                  onClick={() => handleDaily30Answer('yes')}
                  className="flex-1 py-5 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-200 rounded-2xl text-stone-600 hover:text-emerald-600 font-light text-lg transition-all duration-200 shadow-sm hover:shadow"
                >
                  yes
                </button>
                <button
                  onClick={() => handleDaily30Answer('no')}
                  className="flex-1 py-5 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-2xl text-stone-600 hover:text-rose-400 font-light text-lg transition-all duration-200 shadow-sm hover:shadow"
                >
                  no
                </button>
              </div>

              {/* Skip */}
              <div className="flex justify-center mt-6">
                <button onClick={skipDaily30Question} className="text-xs text-stone-300 hover:text-stone-400 transition-colors font-light">
                  skip
                </button>
              </div>

              {/* Footnote section - hashtags and fine print below skip */}
              <FootnoteSection question={currentDailyQuestion} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN HOME VIEW ============
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center px-6 pb-8">
        <div className="max-w-sm w-full">
          <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>

            {/* Media */}
            {currentQuestion?.mediaUrl && (
              <div className="flex justify-center mb-6">
                <img
                  src={currentQuestion.mediaUrl}
                  alt=""
                  className="max-h-40 rounded-xl shadow-md object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Type indicator dot */}
            <div className="flex justify-center mb-4">
              <div
                className="w-2 h-2 rounded-full opacity-60"
                style={{ backgroundColor: typeColors[currentQuestion?.type] || typeColors.default }}
              />
            </div>

            {/* Question */}
            <h2 className="text-2xl md:text-3xl font-light text-stone-700 text-center leading-relaxed mb-8 px-4">
              {currentQuestion?.text}
            </h2>

            {/* Yes/No buttons */}
            <div className="flex gap-4 px-4">
              <button
                onClick={() => handleAnswer('yes')}
                className="flex-1 py-5 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-200 rounded-2xl text-stone-600 hover:text-emerald-600 font-light text-lg transition-all duration-200 shadow-sm hover:shadow"
              >
                yes
              </button>
              <button
                onClick={() => handleAnswer('no')}
                className="flex-1 py-5 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-2xl text-stone-600 hover:text-rose-400 font-light text-lg transition-all duration-200 shadow-sm hover:shadow"
              >
                no
              </button>
            </div>

            {/* Skip button */}
            <div className="flex justify-center mt-6">
              <button onClick={handleSkip} className="text-xs text-stone-300 hover:text-stone-400 transition-colors font-light">
                skip
              </button>
            </div>

            {/* Footnote section - hashtags and fine print below skip */}
            <FootnoteSection question={currentQuestion} />
          </div>
        </div>
      </div>
    </div>
  );
}
