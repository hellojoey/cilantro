import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { questions, gardens, getDailyQuestions, SEEDS } from '../data/questions';

const CilantroContext = createContext(null);

// localStorage helpers
const loadFromStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(`cilantro_${key}`);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(`cilantro_${key}`, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — silently fail
  }
};

// Check if a date string is today
const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
};

// Check if a date string is yesterday
const isYesterday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
};

export function CilantroProvider({ children }) {
  // ── Theme state ──
  const [darkMode, setDarkMode] = useState(() => loadFromStorage('darkMode', false));

  // Apply dark class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveToStorage('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  // ── Auth state ──
  const [isLoggedIn, setIsLoggedIn] = useState(() => loadFromStorage('isLoggedIn', false));
  const [user, setUser] = useState(() => loadFromStorage('user', null));

  // ── Core state (persisted) ──
  const [answers, setAnswers] = useState(() => loadFromStorage('answers', []));
  const [seeds, setSeeds] = useState(() => loadFromStorage('seeds', SEEDS.STARTING_BALANCE));
  const [gardenUnlocks, setGardenUnlocks] = useState(() => loadFromStorage('gardenUnlocks', {}));
  const [gardenCompletions, setGardenCompletions] = useState(() => loadFromStorage('gardenCompletions', {}));
  const [skippedQuestions, setSkippedQuestions] = useState(() => loadFromStorage('skipped', []));

  // ── Daily 30 state (persisted) ──
  const [dailyStreak, setDailyStreak] = useState(() => {
    const stored = loadFromStorage('dailyStreak', { count: 0, lastDate: null });
    // Reset streak if last completion wasn't yesterday or today
    if (stored.lastDate && !isToday(stored.lastDate) && !isYesterday(stored.lastDate)) {
      return { count: 0, lastDate: null };
    }
    return stored;
  });
  const [dailyAnswered, setDailyAnswered] = useState(() => {
    const stored = loadFromStorage('dailyAnswered', { count: 0, date: null });
    // Reset if not today
    if (!isToday(stored.date)) {
      return { count: 0, date: new Date().toISOString() };
    }
    return stored;
  });

  // ── Transient state (not persisted) ──
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [seedAnimation, setSeedAnimation] = useState(null);
  const [dailyQuestions] = useState(getDailyQuestions);

  // ── Persist to localStorage on change ──
  useEffect(() => saveToStorage('isLoggedIn', isLoggedIn), [isLoggedIn]);
  useEffect(() => saveToStorage('user', user), [user]);
  useEffect(() => saveToStorage('answers', answers), [answers]);
  useEffect(() => saveToStorage('seeds', seeds), [seeds]);
  useEffect(() => saveToStorage('gardenUnlocks', gardenUnlocks), [gardenUnlocks]);
  useEffect(() => saveToStorage('gardenCompletions', gardenCompletions), [gardenCompletions]);
  useEffect(() => saveToStorage('skipped', skippedQuestions), [skippedQuestions]);
  useEffect(() => saveToStorage('dailyStreak', dailyStreak), [dailyStreak]);
  useEffect(() => saveToStorage('dailyAnswered', dailyAnswered), [dailyAnswered]);

  // ── Initialize first question ──
  useEffect(() => {
    if (!currentQuestion) {
      setCurrentQuestion(getNewQuestion());
    }
  }, []);

  // ── Seed animation helper ──
  const showSeedAnimation = useCallback((text) => {
    setSeedAnimation(text);
    setTimeout(() => setSeedAnimation(null), 1500);
  }, []);

  // ── Earn seeds ──
  const earnSeeds = useCallback((difficulty) => {
    const earned = difficulty || 1;
    setSeeds(prev => prev + earned);
    showSeedAnimation(`+${earned}`);
  }, [showSeedAnimation]);

  // ── Get new question ──
  const getNewQuestion = useCallback(() => {
    let available = questions.filter((_, i) => !usedQuestions.includes(i));
    if (available.length === 0) {
      setUsedQuestions([]);
      available = [...questions];
    }
    const randomIndex = Math.floor(Math.random() * available.length);
    const questionIndex = questions.indexOf(available[randomIndex]);
    setUsedQuestions(prev => [...prev, questionIndex]);
    return available[randomIndex];
  }, [usedQuestions]);

  // ── Answer a free-play question ──
  const handleAnswer = useCallback((answer) => {
    if (!currentQuestion) return;
    setIsTransitioning(true);
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
  }, [currentQuestion, earnSeeds, getNewQuestion]);

  // ── Skip a free-play question ──
  const handleSkip = useCallback(() => {
    if (!currentQuestion) return;
    setIsTransitioning(true);
    setSkippedQuestions(prev => [...prev, currentQuestion]);
    setTimeout(() => {
      setCurrentQuestion(getNewQuestion());
      setIsTransitioning(false);
    }, 300);
  }, [currentQuestion, getNewQuestion]);

  // ── Change an answer (costs seeds) ──
  const changeAnswer = useCallback((index) => {
    if (seeds < SEEDS.CHANGE_ANSWER_COST) {
      showSeedAnimation('Not enough seeds!');
      return;
    }

    setSeeds(prev => prev - SEEDS.CHANGE_ANSWER_COST);
    showSeedAnimation(`-${SEEDS.CHANGE_ANSWER_COST}`);

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
  }, [seeds, showSeedAnimation]);

  // ── Garden methods ──
  const isGardenUnlocked = useCallback((gardenId) => {
    return gardenUnlocks[gardenId] === true;
  }, [gardenUnlocks]);

  const getGardenProgress = useCallback((gardenId) => {
    return gardenCompletions[gardenId] || 0;
  }, [gardenCompletions]);

  const unlockGarden = useCallback((garden) => {
    if (seeds < garden.seedCost) {
      showSeedAnimation('Not enough seeds!');
      return false;
    }
    setSeeds(prev => prev - garden.seedCost);
    setGardenUnlocks(prev => ({ ...prev, [garden.id]: true }));
    showSeedAnimation(`-${garden.seedCost} 🔓`);
    return true;
  }, [seeds, showSeedAnimation]);

  const peekGarden = useCallback((garden) => {
    if (seeds < SEEDS.PEEK_COST) {
      showSeedAnimation('Not enough seeds!');
      return null;
    }
    setSeeds(prev => prev - SEEDS.PEEK_COST);
    showSeedAnimation(`-${SEEDS.PEEK_COST}`);
    // Return preview questions instead of using alert()
    return garden.questions.slice(0, 3);
  }, [seeds, showSeedAnimation]);

  const handleGardenAnswer = useCallback((garden, questionIndex, answer) => {
    const currentQ = garden.questions[questionIndex];
    earnSeeds(currentQ.difficulty);

    setAnswers(prev => [...prev, {
      text: currentQ.text,
      type: 'garden',
      difficulty: currentQ.difficulty,
      gardenId: garden.id,
      gardenName: garden.name,
      answer,
      timestamp: new Date().toISOString()
    }]);

    // Track garden progress
    setGardenCompletions(prev => ({
      ...prev,
      [garden.id]: Math.max((prev[garden.id] || 0), questionIndex + 1)
    }));

    // Check if garden completed
    if (questionIndex >= garden.questions.length - 1) {
      const totalDifficulty = garden.questions.reduce((sum, q) => sum + q.difficulty, 0);
      const bonus = totalDifficulty * SEEDS.GARDEN_COMPLETION_MULTIPLIER;
      setSeeds(prev => prev + bonus);
      showSeedAnimation(`+${bonus} bonus!`);
      return true; // signals completion
    }
    return false;
  }, [earnSeeds, showSeedAnimation]);

  // ── Daily 30 methods ──
  const handleDaily30Answer = useCallback((questionIndex, answer) => {
    const currentQ = dailyQuestions[questionIndex];
    earnSeeds(currentQ.difficulty);

    setAnswers(prev => [...prev, {
      text: currentQ.text,
      type: 'daily30',
      difficulty: currentQ.difficulty,
      answer,
      timestamp: new Date().toISOString()
    }]);

    setDailyAnswered(prev => ({
      count: prev.count + 1,
      date: new Date().toISOString()
    }));

    // Check if Daily 30 completed
    if (questionIndex >= 29) {
      const newStreak = dailyStreak.count + 1;
      setDailyStreak({ count: newStreak, lastDate: new Date().toISOString() });
      const streakBonus = SEEDS.DAILY_30_BASE_BONUS + (newStreak * SEEDS.DAILY_30_STREAK_MULTIPLIER);
      setSeeds(prev => prev + streakBonus);
      showSeedAnimation(`+${streakBonus} Daily 30 bonus!`);
      return true; // signals completion
    }
    return false;
  }, [dailyQuestions, dailyStreak, earnSeeds, showSeedAnimation]);

  // ── Auth methods ──
  const login = useCallback((usernameVal) => {
    const newUser = { firstName: usernameVal.split('_')[0], username: usernameVal };
    setUser(newUser);
    setIsLoggedIn(true);
  }, []);

  const signup = useCallback((firstNameVal, usernameVal) => {
    const newUser = { firstName: firstNameVal, username: usernameVal };
    setUser(newUser);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  // ── Computed values ──
  const yesCount = answers.filter(a => a.answer === 'yes').length;
  const noCount = answers.filter(a => a.answer === 'no').length;

  const value = {
    // Theme
    darkMode, toggleDarkMode,
    // Auth
    isLoggedIn, user, login, signup, logout,
    // Questions
    currentQuestion, isTransitioning,
    handleAnswer, handleSkip,
    // Answers
    answers, yesCount, noCount, changeAnswer,
    skippedQuestions,
    // Seeds
    seeds, seedAnimation, earnSeeds, showSeedAnimation,
    // Gardens
    gardens, gardenUnlocks, gardenCompletions,
    isGardenUnlocked, getGardenProgress,
    unlockGarden, peekGarden,
    handleGardenAnswer,
    // Daily 30
    dailyQuestions, dailyAnswered, dailyStreak,
    handleDaily30Answer,
  };

  return (
    <CilantroContext.Provider value={value}>
      {children}
    </CilantroContext.Provider>
  );
}

export function useCilantro() {
  const context = useContext(CilantroContext);
  if (!context) {
    throw new Error('useCilantro must be used within a CilantroProvider');
  }
  return context;
}
