import React, { useState, useEffect } from 'react';

const questions = [
  // Deep & Reflective (mostly medium/hard)
  { text: "Did you feel at peace today?", type: "deep", difficulty: 2 },
  { text: "Are you proud of who you're becoming?", type: "deep", difficulty: 3 },
  { text: "Did you listen to your intuition recently?", type: "deep", difficulty: 2 },
  { text: "Is there something you need to forgive yourself for?", type: "deep", difficulty: 3 },
  { text: "Are you being honest with yourself?", type: "deep", difficulty: 3 },
  { text: "Did you make time for silence today?", type: "deep", difficulty: 1 },
  { text: "Are you holding onto something you should let go?", type: "deep", difficulty: 3 },
  { text: "Did you feel grateful for something small?", type: "deep", difficulty: 1 },
  { text: "Are you where you thought you'd be at this point in life?", type: "deep", difficulty: 3 },
  { text: "Did you choose kindness over being right?", type: "deep", difficulty: 2 },
  { text: "Is your heart lighter than it was yesterday?", type: "deep", difficulty: 2 },
  { text: "Did you do something that scared you?", type: "deep", difficulty: 2 },

  // Light-hearted & Fun (mostly easy)
  { text: "Did you laugh out loud today?", type: "light", difficulty: 1 },
  { text: "Have you danced when nobody was watching?", type: "light", difficulty: 1 },
  { text: "Did you eat something delicious?", type: "light", difficulty: 1 },
  { text: "Have you taken a really good nap recently?", type: "light", difficulty: 1 },
  { text: "Did you sing in the shower?", type: "light", difficulty: 1 },
  { text: "Have you worn your favorite outfit this week?", type: "light", difficulty: 1 },
  { text: "Did you pet a dog or cat today?", type: "light", difficulty: 1 },
  { text: "Have you watched the clouds go by?", type: "light", difficulty: 1 },
  { text: "Did you treat yourself to something nice?", type: "light", difficulty: 1 },
  { text: "Have you stayed in pajamas all day (unapologetically)?", type: "light", difficulty: 1 },
  { text: "Did you take a photo of something beautiful?", type: "light", difficulty: 1 },
  { text: "Have you had breakfast for dinner?", type: "light", difficulty: 1 },

  // Social & Relationships (mixed)
  { text: "Did you tell someone you appreciate them?", type: "social", difficulty: 2 },
  { text: "Have you called a friend just to chat?", type: "social", difficulty: 1 },
  { text: "Did you make someone smile today?", type: "social", difficulty: 1 },
  { text: "Have you hugged someone you love?", type: "social", difficulty: 1 },
  { text: "Did you really listen when someone talked to you?", type: "social", difficulty: 2 },
  { text: "Have you reconnected with an old friend?", type: "social", difficulty: 2 },
  { text: "Did you ask someone how they're really doing?", type: "social", difficulty: 2 },
  { text: "Have you shared a meal with someone?", type: "social", difficulty: 1 },
  { text: "Did you compliment a stranger?", type: "social", difficulty: 2 },
  { text: "Have you sent a thinking-of-you text?", type: "social", difficulty: 1 },
  { text: "Did you forgive someone today?", type: "social", difficulty: 3 },
  { text: "Have you made plans to see someone you miss?", type: "social", difficulty: 2 },

  // Pop Culture & Entertainment (mostly easy)
  { text: "Have you watched a movie that made you cry?", type: "popculture", difficulty: 1 },
  { text: "Do you know all the words to a Taylor Swift song?", type: "popculture", difficulty: 1 },
  { text: "Have you binged an entire series in one sitting?", type: "popculture", difficulty: 1 },
  { text: "Did you get emotionally attached to a fictional character?", type: "popculture", difficulty: 1 },
  { text: "Have you ever dressed up for a movie premiere?", type: "popculture", difficulty: 1 },
  { text: "Do you have a celebrity crush?", type: "popculture", difficulty: 1 },
  { text: "Have you cried during an animated movie?", type: "popculture", difficulty: 1 },
  { text: "Did you rewatch a comfort show recently?", type: "popculture", difficulty: 1 },
  { text: "Have you listened to a song on repeat for hours?", type: "popculture", difficulty: 1 },
  { text: "Do you know more about a fictional universe than real history?", type: "popculture", difficulty: 1 },
  { text: "Have you quoted a movie in a real conversation?", type: "popculture", difficulty: 1 },
  { text: "Did you discover a new artist you love?", type: "popculture", difficulty: 1 },

  // Trivia & Random (mixed)
  { text: "Can you name all the planets in order?", type: "trivia", difficulty: 2 },
  { text: "Do you know your blood type?", type: "trivia", difficulty: 1 },
  { text: "Have you ever seen a shooting star?", type: "trivia", difficulty: 1 },
  { text: "Can you fold a paper crane?", type: "trivia", difficulty: 2 },
  { text: "Do you know how to read a map without GPS?", type: "trivia", difficulty: 2 },
  { text: "Have you ever grown something from a seed?", type: "trivia", difficulty: 1 },
  { text: "Can you name a constellation in the night sky?", type: "trivia", difficulty: 2 },
  { text: "Do you remember your childhood phone number?", type: "trivia", difficulty: 2 },
  { text: "Have you ever been to a different continent?", type: "trivia", difficulty: 1 },
  { text: "Can you cook a meal without a recipe?", type: "trivia", difficulty: 1 },
  { text: "Do you know the capital of Australia?", type: "trivia", difficulty: 2 },
  { text: "Have you ever written a letter by hand?", type: "trivia", difficulty: 1 },

  // Daily Life & Wellness (mostly easy)
  { text: "Did you drink enough water today?", type: "wellness", difficulty: 1 },
  { text: "Have you stretched your body?", type: "wellness", difficulty: 1 },
  { text: "Did you get some fresh air?", type: "wellness", difficulty: 1 },
  { text: "Have you taken a deep breath on purpose?", type: "wellness", difficulty: 1 },
  { text: "Did you put your phone down for an hour?", type: "wellness", difficulty: 2 },
  { text: "Have you done something just for yourself?", type: "wellness", difficulty: 2 },
  { text: "Did you go to bed at a reasonable time?", type: "wellness", difficulty: 2 },
  { text: "Have you moved your body today?", type: "wellness", difficulty: 1 },
  { text: "Did you eat a vegetable?", type: "wellness", difficulty: 1 },
  { text: "Have you looked up from your screen at the sky?", type: "wellness", difficulty: 1 },
];

// Soft, calming color palette
const typeColors = {
  deep: '#8B9DC3',
  light: '#B8D4E3',
  social: '#F2B5D4',
  popculture: '#C9B1FF',
  trivia: '#98D8C8',
  wellness: '#F7DC6F'
};

// Gardens - themed question collections
const gardens = [
  {
    id: 'shadows',
    name: 'Shadows',
    description: 'The parts of yourself you avoid',
    icon: '🌑',
    color: '#4A5568',
    seedCost: 300,
    tier: 3,
    questions: [
      { text: "Are you running from something you should face?", difficulty: 3 },
      { text: "Do you judge others for traits you see in yourself?", difficulty: 3 },
      { text: "Have you been lying to yourself about something important?", difficulty: 3 },
      { text: "Is there a part of yourself you're ashamed of?", difficulty: 3 },
      { text: "Are you the villain in someone else's story?", difficulty: 3 },
      { text: "Do you self-sabotage when things are going well?", difficulty: 3 },
      { text: "Are you addicted to something you won't admit?", difficulty: 3 },
      { text: "Have you hurt someone and never apologized?", difficulty: 3 },
      { text: "Do you secretly enjoy other people's failures?", difficulty: 3 },
      { text: "Are you pretending to be someone you're not?", difficulty: 3 }
    ]
  },
  {
    id: 'mirrors',
    name: 'Mirrors',
    description: 'Honest reflections on who you are',
    icon: '🪞',
    color: '#718096',
    seedCost: 200,
    tier: 2,
    questions: [
      { text: "Would you want to be friends with yourself?", difficulty: 2 },
      { text: "Do people know the real you?", difficulty: 2 },
      { text: "Are you living your life or someone else's expectations?", difficulty: 3 },
      { text: "If you met yourself, would you trust you?", difficulty: 2 },
      { text: "Are your values actually reflected in your actions?", difficulty: 3 },
      { text: "Do you like who you become when you're alone?", difficulty: 2 },
      { text: "Are you the same person in private as in public?", difficulty: 2 },
      { text: "Would your younger self be disappointed in you?", difficulty: 3 },
      { text: "Are you kind when no one is watching?", difficulty: 2 },
      { text: "Do you take more than you give?", difficulty: 2 }
    ]
  },
  {
    id: 'crossroads',
    name: 'Crossroads',
    description: 'Life decisions and regrets',
    icon: '⚖️',
    color: '#9F7AEA',
    seedCost: 250,
    tier: 2,
    questions: [
      { text: "Is there a decision you've been avoiding?", difficulty: 2 },
      { text: "Are you staying somewhere out of fear, not love?", difficulty: 3 },
      { text: "Have you given up on a dream too easily?", difficulty: 3 },
      { text: "Are you in the right career for your soul?", difficulty: 3 },
      { text: "Is there someone you should let go of?", difficulty: 3 },
      { text: "Are you choosing comfort over growth?", difficulty: 2 },
      { text: "Would you make the same choices if you could start over?", difficulty: 3 },
      { text: "Are you waiting for permission to live your life?", difficulty: 2 },
      { text: "Is fear making your decisions for you?", difficulty: 2 },
      { text: "Are you settling for less than you deserve?", difficulty: 2 }
    ]
  },
  {
    id: 'roots',
    name: 'Roots',
    description: 'Family, origin, and belonging',
    icon: '🌳',
    color: '#48BB78',
    seedCost: 200,
    tier: 2,
    questions: [
      { text: "Have you forgiven your parents for their mistakes?", difficulty: 3 },
      { text: "Are you repeating patterns from your childhood?", difficulty: 3 },
      { text: "Do you feel like you belong somewhere?", difficulty: 2 },
      { text: "Are there family wounds you haven't healed?", difficulty: 3 },
      { text: "Do you carry guilt that isn't yours?", difficulty: 3 },
      { text: "Have you become what your family expected?", difficulty: 2 },
      { text: "Is there a conversation with family you need to have?", difficulty: 2 },
      { text: "Do you know where you come from?", difficulty: 1 },
      { text: "Are you running toward something or away from your past?", difficulty: 3 },
      { text: "Have you made peace with your upbringing?", difficulty: 3 }
    ]
  },
  {
    id: 'depths',
    name: 'Depths',
    description: 'Mortality, meaning, and existence',
    icon: '🌊',
    color: '#4299E1',
    seedCost: 400,
    tier: 3,
    questions: [
      { text: "Are you afraid of dying?", difficulty: 3 },
      { text: "Do you know what you're living for?", difficulty: 3 },
      { text: "Would your life have meaning if no one remembered you?", difficulty: 3 },
      { text: "Have you accepted that you won't live forever?", difficulty: 3 },
      { text: "Are you at peace with uncertainty?", difficulty: 3 },
      { text: "Do you believe you matter in the grand scheme?", difficulty: 3 },
      { text: "Have you found something worth suffering for?", difficulty: 3 },
      { text: "Are you running out of time for what matters most?", difficulty: 3 },
      { text: "Do you know what you'd regret on your deathbed?", difficulty: 3 },
      { text: "Have you truly lived, or just existed?", difficulty: 3 }
    ]
  }
];

// Format timestamp to readable format
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

// Generate consistent Daily 30 questions based on date (same for all users)
const getDailyQuestions = () => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  // Simple seeded shuffle
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor((Math.sin(seed + i) * 10000) % (i + 1));
    const k = j < 0 ? -j : j;
    [shuffled[i], shuffled[k % (i + 1)]] = [shuffled[k % (i + 1)], shuffled[i]];
  }

  return shuffled.slice(0, 30);
};

export default function Cilantro() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation state
  const [currentView, setCurrentView] = useState('home'); // 'home', 'gardens', 'garden-detail', 'daily30'
  const [selectedGarden, setSelectedGarden] = useState(null);
  const [gardenQuestionIndex, setGardenQuestionIndex] = useState(0);

  // Daily 30 tracking
  const [dailyQuestions] = useState(getDailyQuestions());
  const [dailyQuestionIndex, setDailyQuestionIndex] = useState(0);
  const [dailyAnswered, setDailyAnswered] = useState(0);
  const [dailyStreak, setDailyStreak] = useState(3); // Demo streak

  // Seeds economy
  const [seeds, setSeeds] = useState(50); // Start with some seeds for demo
  const [gardenUnlocks, setGardenUnlocks] = useState({}); // { gardenId: true }
  const [seedAnimation, setSeedAnimation] = useState(null); // For showing "+X seeds" feedback

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to true for testing
  const [authView, setAuthView] = useState('welcome'); // 'welcome', 'login', 'signup'
  const [firstName, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState({ firstName: 'Joey', username: 'joey_reflects' }); // Default user for testing

  // Earn seeds based on question difficulty
  const earnSeeds = (difficulty) => {
    const earned = difficulty || 1; // 1 for easy, 2 for medium, 3 for hard
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

  // Initialize with first question
  useEffect(() => {
    setCurrentQuestion(getNewQuestion());
  }, []);

  const handleAnswer = (answer) => {
    setIsTransitioning(true);

    // Earn seeds based on difficulty
    earnSeeds(currentQuestion.difficulty);

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
    setSkippedQuestions(prev => [...prev, currentQuestion]);
    setTimeout(() => {
      setCurrentQuestion(getNewQuestion());
      setIsTransitioning(false);
    }, 300);
  };

  // Garden handlers
  const isGardenUnlocked = (gardenId) => {
    return gardenUnlocks[gardenId] === true;
  };

  const unlockGarden = (garden) => {
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

  const peekGarden = (garden) => {
    const PEEK_COST = 10;
    if (seeds < PEEK_COST) {
      setSeedAnimation('Not enough seeds!');
      setTimeout(() => setSeedAnimation(null), 1500);
      return;
    }

    setSeeds(prev => prev - PEEK_COST);
    setSeedAnimation(`-${PEEK_COST}`);
    setTimeout(() => setSeedAnimation(null), 1500);

    // Show garden questions briefly (would need modal, for now just unlock temporarily)
    alert(`Peek at "${garden.name}":\n\n${garden.questions.slice(0, 3).map(q => `• ${q.text}`).join('\n')}\n\n...and ${garden.questions.length - 3} more questions`);
  };

  const openGarden = (garden) => {
    if (!isGardenUnlocked(garden.id)) {
      return; // Can't open locked garden
    }
    setSelectedGarden(garden);
    setGardenQuestionIndex(0);
    setCurrentView('garden-detail');
  };

  const handleGardenAnswer = (answer) => {
    setIsTransitioning(true);
    const currentQ = selectedGarden.questions[gardenQuestionIndex];

    // Earn seeds based on difficulty
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
        // Garden completed bonus: sum of difficulties × 2
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
    setCurrentView('daily30');
  };

  const handleDaily30Answer = (answer) => {
    setIsTransitioning(true);
    const currentQ = dailyQuestions[dailyQuestionIndex];

    // Earn seeds based on difficulty
    earnSeeds(currentQ.difficulty);

    setAnswers(prev => [...prev, {
      text: currentQ.text,
      type: 'daily30',
      difficulty: currentQ.difficulty,
      answer,
      timestamp: new Date().toISOString()
    }]);

    setDailyAnswered(prev => prev + 1);

    setTimeout(() => {
      if (dailyQuestionIndex < 29) {
        setDailyQuestionIndex(prev => prev + 1);
      } else {
        // Daily 30 completed: +30 bonus, × streak multiplier
        const streakBonus = 30 + (dailyStreak * 5);
        setSeeds(prev => prev + streakBonus);
        setSeedAnimation(`+${streakBonus} Daily 30 bonus!`);
        setTimeout(() => setSeedAnimation(null), 2500);
        setCurrentView('home');
      }
      setIsTransitioning(false);
    }, 400);
  };

  const skipDaily30Question = () => {
    setIsTransitioning(true);
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

    // Check if user has enough seeds
    if (seeds < CHANGE_COST) {
      setSeedAnimation('Not enough seeds!');
      setTimeout(() => setSeedAnimation(null), 1500);
      return;
    }

    // Deduct seeds
    setSeeds(prev => prev - CHANGE_COST);
    setSeedAnimation(`-${CHANGE_COST}`);
    setTimeout(() => setSeedAnimation(null), 1500);

    setAnswers(prev => prev.map((a, i) => {
      if (i === index) {
        const newAnswer = a.answer === 'yes' ? 'no' : 'yes';
        const historyEntry = {
          answer: a.answer,
          timestamp: a.updatedAt || a.timestamp
        };
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

  // Auth handlers (to be connected to backend later)
  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: Connect to actual auth
    setUser({ firstName: username.split('_')[0], username });
    setIsLoggedIn(true);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // TODO: Connect to actual auth
    setUser({ firstName, username });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setAuthView('welcome');
    setFirstName('');
    setUsername('');
    setPassword('');
  };

  // Auth Views
  if (!isLoggedIn) {
    // Welcome screen
    if (authView === 'welcome') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col items-center justify-center px-6">
          <div className="max-w-sm w-full text-center">
            {/* Logo/Brand */}
            <div className="mb-12">
              <h1 className="text-5xl font-light tracking-wide text-stone-600 mb-3">
                cilantro
              </h1>
              <p className="text-stone-400 font-light">
                yes or no. find yourself.
              </p>
            </div>

            {/* Decorative dots */}
            <div className="flex justify-center gap-2 mb-12">
              {Object.values(typeColors).map((color, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full opacity-40"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Auth buttons */}
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

            <p className="mt-8 text-xs text-stone-300 font-light">
              reflect. grow. repeat.
            </p>
          </div>
        </div>
      );
    }

    // Login screen
    if (authView === 'login') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col px-6 pt-12">
          <div className="max-w-sm w-full mx-auto">
            {/* Back button */}
            <button
              onClick={() => setAuthView('welcome')}
              className="text-stone-400 hover:text-stone-600 transition-colors text-sm mb-8"
            >
              ← back
            </button>

            <h2 className="text-3xl font-light text-stone-600 mb-2">welcome back</h2>
            <p className="text-stone-400 font-light mb-8">continue your reflections</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full py-4 px-4 bg-white border border-stone-200 rounded-2xl text-stone-600 placeholder-stone-300 focus:outline-none focus:border-stone-300 font-light"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-4 px-4 bg-white border border-stone-200 rounded-2xl text-stone-600 placeholder-stone-300 focus:outline-none focus:border-stone-300 font-light"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-stone-700 hover:bg-stone-800 text-white rounded-2xl font-light text-lg transition-all shadow-sm mt-6"
              >
                sign in
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-stone-400 font-light">
              don't have an account?{' '}
              <button
                onClick={() => setAuthView('signup')}
                className="text-stone-600 hover:text-stone-800 underline"
              >
                sign up
              </button>
            </p>
          </div>
        </div>
      );
    }

    // Signup screen
    if (authView === 'signup') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col px-6 pt-12">
          <div className="max-w-sm w-full mx-auto">
            {/* Back button */}
            <button
              onClick={() => setAuthView('welcome')}
              className="text-stone-400 hover:text-stone-600 transition-colors text-sm mb-8"
            >
              ← back
            </button>

            <h2 className="text-3xl font-light text-stone-600 mb-2">create account</h2>
            <p className="text-stone-400 font-light mb-8">start your journey of reflection</p>

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full py-4 px-4 bg-white border border-stone-200 rounded-2xl text-stone-600 placeholder-stone-300 focus:outline-none focus:border-stone-300 font-light"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full py-4 px-4 bg-white border border-stone-200 rounded-2xl text-stone-600 placeholder-stone-300 focus:outline-none focus:border-stone-300 font-light"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-4 px-4 bg-white border border-stone-200 rounded-2xl text-stone-600 placeholder-stone-300 focus:outline-none focus:border-stone-300 font-light"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-stone-700 hover:bg-stone-800 text-white rounded-2xl font-light text-lg transition-all shadow-sm mt-6"
              >
                create account
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-stone-400 font-light">
              already have an account?{' '}
              <button
                onClick={() => setAuthView('login')}
                className="text-stone-600 hover:text-stone-800 underline"
              >
                sign in
              </button>
            </p>
          </div>
        </div>
      );
    }
  }

  if (!currentQuestion) return null;

  const yesCount = answers.filter(a => a.answer === 'yes').length;
  const noCount = answers.filter(a => a.answer === 'no').length;

  // Profile View
  if (showProfile) {
    const filteredAnswers = searchQuery
      ? answers.filter(a => a.text.toLowerCase().includes(searchQuery.toLowerCase()))
      : answers;

    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col">
        <div className="pt-8 pb-4 px-6">
          <div className="max-w-sm mx-auto flex justify-between items-center">
            <button
              onClick={() => setShowProfile(false)}
              className="text-stone-400 hover:text-stone-600 transition-colors text-sm"
            >
              ← back
            </button>
            <h1 className="text-2xl font-light tracking-wide text-stone-400">
              profile
            </h1>
            <div className="w-12"></div>
          </div>
        </div>

        <div className="flex-1 px-6 pb-8 overflow-auto">
          <div className="max-w-sm mx-auto">
            {/* User info */}
            {user && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                      <span className="text-stone-500 font-light text-lg">
                        {user.firstName?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-stone-600 font-light">{user.firstName}</p>
                      <p className="text-xs text-stone-300">@{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    sign out
                  </button>
                </div>

                {/* Seeds display */}
                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌱</span>
                    <span className="text-2xl font-light text-stone-700">{seeds}</span>
                    <span className="text-sm text-stone-400">seeds</span>
                  </div>
                  {seedAnimation && (
                    <span className={`text-sm font-medium animate-pulse ${
                      seedAnimation.startsWith('-') || seedAnimation.startsWith('Not')
                        ? 'text-rose-400'
                        : 'text-emerald-500'
                    }`}>
                      {seedAnimation}
                    </span>
                  )}
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
                onClick={() => { setShowProfile(false); startDaily30(); }}
                className="w-full py-3 bg-stone-700 hover:bg-stone-800 text-white rounded-xl font-light text-sm transition-all"
              >
                {dailyAnswered === 0 ? 'start today\'s daily 30' : dailyAnswered < 30 ? 'continue daily 30' : 'completed ✓'}
              </button>
            </div>

            {/* Stats overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-3xl font-light text-stone-700">{answers.length}</div>
                  <div className="text-xs text-stone-400 mt-1">answered</div>
                </div>
                <div className="w-px bg-stone-100"></div>
                <div>
                  <div className="text-3xl font-light text-emerald-500">{yesCount}</div>
                  <div className="text-xs text-stone-400 mt-1">yes</div>
                </div>
                <div className="w-px bg-stone-100"></div>
                <div>
                  <div className="text-3xl font-light text-rose-400">{noCount}</div>
                  <div className="text-xs text-stone-400 mt-1">no</div>
                </div>
              </div>
              {answers.length > 0 && (
                <div className="mt-4 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-300 to-emerald-400 transition-all"
                    style={{ width: `${(yesCount / answers.length) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Skipped questions */}
            {skippedQuestions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
                <h3 className="text-sm text-stone-400 mb-4 font-light">skipped ({skippedQuestions.length})</h3>
                <div className="space-y-3 max-h-48 overflow-auto">
                  {skippedQuestions.map((q, i) => (
                    <p key={i} className="text-sm text-stone-500 font-light">{q.text}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Answer Log */}
            {answers.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-stone-400 font-light">your reflections</h3>
                </div>

                {/* Search input */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="search reflections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 px-3 text-sm bg-stone-50 border border-stone-100 rounded-xl text-stone-600 placeholder-stone-300 focus:outline-none focus:border-stone-200 font-light"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-400"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="space-y-4 max-h-96 overflow-auto">
                  {[...filteredAnswers].reverse().map((a, i) => {
                    const actualIndex = answers.indexOf(a);
                    return (
                      <div key={i} className="border-b border-stone-50 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: typeColors[a.type] }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-stone-600 font-light leading-relaxed">
                              {a.text}
                            </p>

                            {/* Current answer */}
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
                              <span className="text-xs text-stone-300">
                                {formatTime(a.updatedAt || a.timestamp)}
                              </span>
                            </div>

                            {/* Answer history */}
                            {a.history && a.history.length > 0 && (
                              <div className="mt-2 pl-2 border-l-2 border-stone-100">
                                {[...a.history].reverse().map((h, hi) => (
                                  <div key={hi} className="flex items-center gap-2 py-1">
                                    <span className={`text-xs ${
                                      h.answer === 'yes' ? 'text-emerald-400' : 'text-rose-300'
                                    }`}>
                                      {h.answer}
                                    </span>
                                    <span className="text-xs text-stone-200">
                                      {formatTime(h.timestamp)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredAnswers.length === 0 && searchQuery && (
                    <p className="text-center text-stone-300 text-sm font-light py-4">
                      no matches found
                    </p>
                  )}
                </div>
              </div>
            )}

            {answers.length === 0 && skippedQuestions.length === 0 && (
              <p className="text-center text-stone-400 font-light mt-12">
                no reflections yet
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Gardens List View
  if (currentView === 'gardens') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col">
        <div className="pt-8 pb-4 px-6">
          <div className="max-w-sm mx-auto flex justify-between items-center">
            <button
              onClick={() => setCurrentView('home')}
              className="text-stone-400 hover:text-stone-600 transition-colors text-sm"
            >
              ← back
            </button>
            <h1 className="text-2xl font-light tracking-wide text-stone-400">
              gardens
            </h1>
            <div className="w-12"></div>
          </div>
        </div>

        <div className="flex-1 px-6 pb-8 overflow-auto">
          <div className="max-w-sm mx-auto">
            <p className="text-center text-stone-400 font-light mb-8">
              collections for deeper reflection
            </p>

            <div className="space-y-4">
              {gardens.map((garden) => {
                const unlocked = isGardenUnlocked(garden.id);
                return (
                  <div
                    key={garden.id}
                    className={`w-full bg-white rounded-2xl p-6 shadow-sm border transition-all text-left ${
                      unlocked ? 'border-stone-100 hover:border-stone-200' : 'border-stone-100 opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                          !unlocked ? 'grayscale opacity-60' : ''
                        }`}
                        style={{ backgroundColor: garden.color + '20' }}
                      >
                        {unlocked ? garden.icon : '🔒'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-stone-700 font-medium">{garden.name}</h3>
                        <p className="text-xs text-stone-400 font-light mt-1">{garden.description}</p>
                      </div>
                      {unlocked ? (
                        <button
                          onClick={() => openGarden(garden)}
                          className="text-stone-300 hover:text-stone-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-stone-400">
                          <span>🌱</span>
                          <span>{garden.seedCost}</span>
                        </div>
                      )}
                    </div>

                    {unlocked ? (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stone-300 rounded-full" style={{ width: '0%' }} />
                        </div>
                        <span className="text-xs text-stone-300">{garden.questions.length} questions</span>
                      </div>
                    ) : (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => unlockGarden(garden)}
                          className="flex-1 py-2 bg-stone-700 hover:bg-stone-800 text-white rounded-xl text-xs font-light transition-all flex items-center justify-center gap-1"
                        >
                          <span>🌱</span> Unlock for {garden.seedCost}
                        </button>
                        <button
                          onClick={() => peekGarden(garden)}
                          className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-light transition-all"
                        >
                          Peek (10 🌱)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Garden Detail View (answering garden questions)
  if (currentView === 'garden-detail' && selectedGarden) {
    const currentGardenQuestion = selectedGarden.questions[gardenQuestionIndex].text;
    const progress = ((gardenQuestionIndex + 1) / selectedGarden.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col">
        <div className="pt-8 pb-4 px-6">
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-4">
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
            {/* Progress bar */}
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
            <div
              className={`transition-all duration-300 ${
                isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
              }`}
            >
              {/* Garden indicator */}
              <div className="flex justify-center mb-6">
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: selectedGarden.color + '20', color: selectedGarden.color }}
                >
                  {selectedGarden.icon} {selectedGarden.name}
                </div>
              </div>

              {/* Question */}
              <h2 className="text-2xl md:text-3xl font-light text-stone-700 text-center leading-relaxed mb-12 px-4">
                {currentGardenQuestion}
              </h2>

              {/* Yes/No buttons */}
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

              {/* Skip button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={skipGardenQuestion}
                  className="text-xs text-stone-300 hover:text-stone-400 transition-colors font-light"
                >
                  skip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Daily 30 View
  if (currentView === 'daily30') {
    const currentDailyQuestion = dailyQuestions[dailyQuestionIndex];
    const progress = ((dailyQuestionIndex + 1) / 30) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col">
        <div className="pt-8 pb-4 px-6">
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setCurrentView('home')}
                className="text-stone-400 hover:text-stone-600 transition-colors text-sm"
              >
                ← exit
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-stone-600">Daily 30</span>
                {dailyStreak > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                    🔥 {dailyStreak}
                  </span>
                )}
              </div>
              <span className="text-xs text-stone-400">
                {dailyQuestionIndex + 1}/30
              </span>
            </div>
            {/* Progress bar */}
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
            <div
              className={`transition-all duration-300 ${
                isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
              }`}
            >
              {/* Type indicator */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-2 h-2 rounded-full opacity-60"
                  style={{ backgroundColor: typeColors[currentDailyQuestion?.type] || '#999' }}
                />
              </div>

              {/* Question */}
              <h2 className="text-2xl md:text-3xl font-light text-stone-700 text-center leading-relaxed mb-12 px-4">
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

              {/* Skip button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={skipDaily30Question}
                  className="text-xs text-stone-300 hover:text-stone-400 transition-colors font-light"
                >
                  skip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex flex-col">
      {/* Header with nav */}
      <div className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-light tracking-wide text-stone-400">
            cilantro
          </h1>
          <div className="flex items-center gap-2">
            {/* Seeds indicator */}
            <div className="flex items-center gap-1 px-2 py-1 bg-white border border-stone-200 rounded-full shadow-sm">
              <span className="text-sm">🌱</span>
              <span className="text-xs font-medium text-stone-500">{seeds}</span>
              {seedAnimation && (
                <span className={`text-xs font-medium ${
                  seedAnimation.startsWith('-') || seedAnimation.startsWith('Not')
                    ? 'text-rose-400'
                    : 'text-emerald-500'
                }`}>
                  {seedAnimation}
                </span>
              )}
            </div>
            {/* Gardens button */}
            <button
              onClick={() => setCurrentView('gardens')}
              className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:border-stone-300 transition-colors shadow-sm"
              title="Gardens"
            >
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-10a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4z" />
                <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {/* Profile button */}
            <button
              onClick={() => setShowProfile(true)}
              className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:border-stone-300 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Question area - centered */}
      <div className="flex-1 flex items-center justify-center px-6 pb-8">
        <div className="max-w-sm w-full">
          {/* Question card */}
          <div
            className={`transition-all duration-300 ${
              isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
            }`}
          >
            {/* Type indicator - subtle dot */}
            <div className="flex justify-center mb-6">
              <div
                className="w-2 h-2 rounded-full opacity-60"
                style={{ backgroundColor: typeColors[currentQuestion.type] }}
              />
            </div>

            {/* Question */}
            <h2 className="text-2xl md:text-3xl font-light text-stone-700 text-center leading-relaxed mb-12 px-4">
              {currentQuestion.text}
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
              <button
                onClick={handleSkip}
                className="text-xs text-stone-300 hover:text-stone-400 transition-colors font-light"
              >
                skip
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
