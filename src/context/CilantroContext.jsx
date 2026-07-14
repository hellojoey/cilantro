import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { questions, gardens, getDailyQuestions, SEEDS } from '../data/questions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { migrateLocalData } from '../lib/migrateLocal';

const CilantroContext = createContext(null);

// ── localStorage helpers (device-level prefs only, e.g. dark mode) ──
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

// ── Date helpers (local calendar day, YYYY-MM-DD) ──
const pad = (n) => String(n).padStart(2, '0');
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toDateKey = (v) => {
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : dateKey(d);
};
const todayKey = () => dateKey(new Date());
const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
};
const isToday = (v) => {
  const k = toDateKey(v);
  return k != null && k === todayKey();
};
const isYesterday = (v) => {
  const k = toDateKey(v);
  return k != null && k === yesterdayKey();
};

// Apply day-rollover reset rules to the loaded daily state.
const normalizeStreak = (s) => {
  if (s.lastDate && !isToday(s.lastDate) && !isYesterday(s.lastDate)) {
    return { count: 0, lastDate: null };
  }
  return s;
};
const normalizeAnswered = (a) => {
  if (!isToday(a.date)) {
    return { count: 0, date: new Date().toISOString() };
  }
  return a;
};

// Map a DB answer row → the in-memory answer shape the UI expects.
const mapAnswerRow = (r) => ({
  id: r.id,
  text: r.question_text,
  vibe: r.vibe,
  difficulty: r.difficulty,
  answer: r.answer,
  timestamp: new Date(r.created_at).toISOString(),
  ...(r.updated_at && r.updated_at !== r.created_at
    ? { updatedAt: new Date(r.updated_at).toISOString() }
    : {}),
  ...(r.garden_id ? { gardenId: r.garden_id, gardenName: r.garden_name } : {}),
  history: Array.isArray(r.history) ? r.history : [],
});

// Translate a Supabase auth error into a friendly, user-facing string.
const friendlyAuthError = (error) => {
  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('invalid login')) return 'Incorrect email or password.';
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'That email is already registered.';
  }
  if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('username')) {
    return 'That username is already taken.';
  }
  if (msg.includes('valid email') || msg.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }
  if (msg.includes('password')) return 'Password must be at least 6 characters.';
  return error?.message || 'Something went wrong. Please try again.';
};

export function CilantroProvider({ children }) {
  // ── Theme state (device pref, stays in localStorage) ──
  const [darkMode, setDarkMode] = useState(() => loadFromStorage('darkMode', false));

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveToStorage('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  // ── Auth state ──
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);

  // ── Core state (backed by Supabase) ──
  const [answers, setAnswers] = useState([]);
  const [seeds, setSeeds] = useState(SEEDS.STARTING_BALANCE);
  const [gardenUnlocks, setGardenUnlocks] = useState({});
  const [gardenCompletions, setGardenCompletions] = useState({});
  const [skippedQuestions, setSkippedQuestions] = useState([]);

  // ── Daily 30 state ──
  const [dailyStreak, setDailyStreak] = useState({ count: 0, lastDate: null });
  const [dailyAnswered, setDailyAnswered] = useState({ count: 0, date: null });

  // ── Transient state (not persisted) ──
  const [usedQuestions, setUsedQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [seedAnimation, setSeedAnimation] = useState(null);
  const [dailyQuestions] = useState(getDailyQuestions);

  // ── Refs for persistence gating ──
  const userIdRef = useRef(null);   // current auth user id (for writes)
  const hydratedRef = useRef(false); // true once initial DB load finished

  // ══════════════════════════════════════════════════════════════
  // Persistence helpers (write-through to Supabase; errors non-fatal)
  // ══════════════════════════════════════════════════════════════
  const persistProfile = useCallback((patch) => {
    if (!supabase || !userIdRef.current) return;
    supabase
      .from('profiles')
      .update(patch)
      .eq('id', userIdRef.current)
      .then(({ error }) => {
        if (error) console.error('persist profile failed', error);
      });
  }, []);

  const insertAnswerRow = useCallback((a, source) => {
    if (!supabase || !userIdRef.current) return;
    supabase
      .from('answers')
      .insert({
        id: a.id,
        user_id: userIdRef.current,
        question_text: a.text,
        vibe: a.vibe,
        difficulty: a.difficulty ?? 1,
        garden_id: a.gardenId ?? null,
        garden_name: a.gardenName ?? null,
        answer: a.answer,
        source,
        history: a.history ?? [],
        created_at: a.timestamp,
        updated_at: a.updatedAt ?? a.timestamp,
      })
      .then(({ error }) => {
        if (error) console.error('insert answer failed', error);
      });
  }, []);

  const updateAnswerRow = useCallback((a) => {
    if (!supabase || !userIdRef.current) return;
    supabase
      .from('answers')
      .update({ answer: a.answer, updated_at: a.updatedAt, history: a.history })
      .eq('id', a.id)
      .then(({ error }) => {
        if (error) console.error('update answer failed', error);
      });
  }, []);

  const upsertGardenState = useCallback((gardenId, fields) => {
    if (!supabase || !userIdRef.current) return;
    supabase
      .from('garden_states')
      .upsert(
        { user_id: userIdRef.current, garden_id: gardenId, ...fields },
        { onConflict: 'user_id,garden_id' }
      )
      .then(({ error }) => {
        if (error) console.error('upsert garden state failed', error);
      });
  }, []);

  const insertSkip = useCallback((skip) => {
    if (!supabase || !userIdRef.current) return;
    supabase
      .from('skips')
      .insert({ user_id: userIdRef.current, question_text: skip.text, vibe: skip.vibe ?? null })
      .then(({ error }) => {
        if (error) console.error('insert skip failed', error);
      });
  }, []);

  // ── Write-through effects for profile-backed scalar state ──
  useEffect(() => {
    if (!hydratedRef.current) return;
    persistProfile({ seeds });
  }, [seeds, persistProfile]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    persistProfile({
      daily_streak_count: dailyStreak.count,
      daily_streak_last_date: toDateKey(dailyStreak.lastDate),
    });
  }, [dailyStreak, persistProfile]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    persistProfile({
      daily_answered_count: dailyAnswered.count,
      daily_answered_date: toDateKey(dailyAnswered.date),
    });
  }, [dailyAnswered, persistProfile]);

  // ══════════════════════════════════════════════════════════════
  // Session load / restore
  // ══════════════════════════════════════════════════════════════
  const fetchProfile = useCallback(async (id) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (data) return data;
      if (error) console.error('fetch profile failed', error);
      // Profile row is created by a DB trigger on signup — retry briefly.
      await new Promise((r) => setTimeout(r, 300));
    }
    return null;
  }, []);

  const loadUserData = useCallback(
    async (sessionUser) => {
      hydratedRef.current = false;
      userIdRef.current = sessionUser.id;
      const id = sessionUser.id;
      try {
        let profile = await fetchProfile(id);

        let answersRes = await supabase
          .from('answers')
          .select('*')
          .eq('user_id', id)
          .order('created_at', { ascending: true });
        if (answersRes.error) console.error('load answers failed', answersRes.error);
        let answerRows = answersRes.data || [];

        // First-login migration: only when the account has no answers yet.
        if (answerRows.length === 0) {
          const migrated = await migrateLocalData(supabase, id);
          if (migrated) {
            profile = await fetchProfile(id);
            const refetch = await supabase
              .from('answers')
              .select('*')
              .eq('user_id', id)
              .order('created_at', { ascending: true });
            answerRows = refetch.data || [];
          }
        }

        const [gsRes, skipRes] = await Promise.all([
          supabase.from('garden_states').select('*').eq('user_id', id),
          supabase
            .from('skips')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: true }),
        ]);
        const gardenStates = gsRes.data || [];
        const skipRows = skipRes.data || [];

        // ── Push into React state ──
        setUser({
          firstName: profile?.first_name ?? '',
          username: profile?.username ?? '',
          email: sessionUser.email,
          id,
          isAdmin: profile?.is_admin ?? false,
        });
        setSeeds(profile ? profile.seeds : SEEDS.STARTING_BALANCE);

        const streak = normalizeStreak({
          count: profile?.daily_streak_count ?? 0,
          lastDate: profile?.daily_streak_last_date ?? null,
        });
        const answered = normalizeAnswered({
          count: profile?.daily_answered_count ?? 0,
          date: profile?.daily_answered_date ?? null,
        });
        setDailyStreak(streak);
        setDailyAnswered(answered);

        setAnswers(answerRows.map(mapAnswerRow));

        const unlocks = {};
        const completions = {};
        gardenStates.forEach((g) => {
          if (g.unlocked) unlocks[g.garden_id] = true;
          completions[g.garden_id] = g.progress;
        });
        setGardenUnlocks(unlocks);
        setGardenCompletions(completions);

        setSkippedQuestions(skipRows.map((s) => ({ text: s.question_text, vibe: s.vibe })));

        setIsLoggedIn(true);

        // Persist any day-rollover reset back to the profile (best-effort).
        if (profile) {
          const patch = {};
          if (
            (profile.daily_streak_count ?? 0) !== streak.count ||
            (profile.daily_streak_last_date ?? null) !== toDateKey(streak.lastDate)
          ) {
            patch.daily_streak_count = streak.count;
            patch.daily_streak_last_date = toDateKey(streak.lastDate);
          }
          if (
            (profile.daily_answered_count ?? 0) !== answered.count ||
            (profile.daily_answered_date ?? null) !== toDateKey(answered.date)
          ) {
            patch.daily_answered_count = answered.count;
            patch.daily_answered_date = toDateKey(answered.date);
          }
          if (Object.keys(patch).length > 0) {
            supabase
              .from('profiles')
              .update(patch)
              .eq('id', id)
              .then(({ error }) => {
                if (error) console.error('persist daily reset failed', error);
              });
          }
        }
      } catch (e) {
        console.error('loadUserData failed', e);
        setIsLoggedIn(true);
      } finally {
        hydratedRef.current = true;
      }
    },
    [fetchProfile]
  );

  const resetUserState = useCallback(() => {
    hydratedRef.current = false;
    setUser(null);
    setIsLoggedIn(false);
    setAnswers([]);
    setSeeds(SEEDS.STARTING_BALANCE);
    setGardenUnlocks({});
    setGardenCompletions({});
    setSkippedQuestions([]);
    setDailyStreak({ count: 0, lastDate: null });
    setDailyAnswered({ count: 0, date: null });
  }, []);

  // ── Auth listener: restore session on load + react to sign in/out ──
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      // Defer Supabase calls out of the auth callback — running them inline
      // can contend with the client's internal auth lock and hang sign-in.
      setTimeout(async () => {
        if (sessionUser) {
          if (userIdRef.current !== sessionUser.id) {
            await loadUserData(sessionUser);
          }
        } else if (userIdRef.current !== null) {
          userIdRef.current = null;
          resetUserState();
        }
        setAuthLoading(false);
      }, 0);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [loadUserData, resetUserState]);

  // ── Initialize first question ──
  useEffect(() => {
    if (!currentQuestion) {
      setCurrentQuestion(getNewQuestion());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Seed animation helper ──
  const showSeedAnimation = useCallback((text) => {
    setSeedAnimation(text);
    setTimeout(() => setSeedAnimation(null), 1500);
  }, []);

  // ── Earn seeds ──
  const earnSeeds = useCallback((difficulty) => {
    const earned = difficulty || 1;
    setSeeds((prev) => prev + earned);
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
    setUsedQuestions((prev) => [...prev, questionIndex]);
    return available[randomIndex];
  }, [usedQuestions]);

  // ── Answer a free-play question ──
  const handleAnswer = useCallback((answer) => {
    if (!currentQuestion) return;
    setIsTransitioning(true);
    earnSeeds(currentQuestion.difficulty);

    const newAnswer = {
      id: crypto.randomUUID(),
      ...currentQuestion,
      answer,
      timestamp: new Date().toISOString(),
    };
    setAnswers((prev) => [...prev, newAnswer]);
    insertAnswerRow(newAnswer, 'free');

    setTimeout(() => {
      setCurrentQuestion(getNewQuestion());
      setIsTransitioning(false);
    }, 400);
  }, [currentQuestion, earnSeeds, getNewQuestion, insertAnswerRow]);

  // ── Skip a free-play question ──
  const handleSkip = useCallback(() => {
    if (!currentQuestion) return;
    setIsTransitioning(true);
    setSkippedQuestions((prev) => [...prev, currentQuestion]);
    insertSkip({ text: currentQuestion.text, vibe: currentQuestion.vibe });
    setTimeout(() => {
      setCurrentQuestion(getNewQuestion());
      setIsTransitioning(false);
    }, 300);
  }, [currentQuestion, getNewQuestion, insertSkip]);

  // ── Change an answer (costs seeds) ──
  const changeAnswer = useCallback((index) => {
    if (seeds < SEEDS.CHANGE_ANSWER_COST) {
      showSeedAnimation('Not enough seeds!');
      return;
    }
    const target = answers[index];
    if (!target) return;

    setSeeds((prev) => prev - SEEDS.CHANGE_ANSWER_COST);
    showSeedAnimation(`-${SEEDS.CHANGE_ANSWER_COST}`);

    const historyEntry = {
      answer: target.answer,
      timestamp: target.updatedAt || target.timestamp,
    };
    const updated = {
      ...target,
      answer: target.answer === 'yes' ? 'no' : 'yes',
      updatedAt: new Date().toISOString(),
      history: [...(target.history || []), historyEntry],
    };

    setAnswers((prev) => prev.map((a, i) => (i === index ? updated : a)));
    updateAnswerRow(updated);
  }, [answers, seeds, showSeedAnimation, updateAnswerRow]);

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
    setSeeds((prev) => prev - garden.seedCost);
    setGardenUnlocks((prev) => ({ ...prev, [garden.id]: true }));
    upsertGardenState(garden.id, {
      unlocked: true,
      progress: gardenCompletions[garden.id] || 0,
    });
    showSeedAnimation(`-${garden.seedCost} 🔓`);
    return true;
  }, [seeds, gardenCompletions, showSeedAnimation, upsertGardenState]);

  const peekGarden = useCallback((garden) => {
    if (seeds < SEEDS.PEEK_COST) {
      showSeedAnimation('Not enough seeds!');
      return null;
    }
    setSeeds((prev) => prev - SEEDS.PEEK_COST);
    showSeedAnimation(`-${SEEDS.PEEK_COST}`);
    return garden.items.slice(0, 3);
  }, [seeds, showSeedAnimation]);

  // ── Garden answer (for question items) ──
  const handleGardenAnswer = useCallback((garden, itemIndex, answer) => {
    const currentItem = garden.items[itemIndex];
    earnSeeds(currentItem.difficulty);

    const newAnswer = {
      id: crypto.randomUUID(),
      text: currentItem.text,
      vibe: currentItem.vibe || garden.name.toLowerCase(),
      difficulty: currentItem.difficulty,
      gardenId: garden.id,
      gardenName: garden.name,
      answer,
      timestamp: new Date().toISOString(),
    };
    setAnswers((prev) => [...prev, newAnswer]);
    insertAnswerRow(newAnswer, 'garden');

    const newProgress = Math.max(gardenCompletions[garden.id] || 0, itemIndex + 1);
    setGardenCompletions((prev) => ({
      ...prev,
      [garden.id]: Math.max((prev[garden.id] || 0), itemIndex + 1),
    }));

    const completed = itemIndex >= garden.items.length - 1;
    upsertGardenState(garden.id, {
      unlocked: true,
      progress: newProgress,
      completed_at: completed ? new Date().toISOString() : null,
    });

    if (completed) {
      const totalDifficulty = garden.items.reduce((sum, item) => sum + item.difficulty, 0);
      const bonus = totalDifficulty * SEEDS.GARDEN_COMPLETION_MULTIPLIER;
      setSeeds((prev) => prev + bonus);
      showSeedAnimation(`+${bonus} bonus!`);
      return true;
    }
    return false;
  }, [earnSeeds, gardenCompletions, showSeedAnimation, insertAnswerRow, upsertGardenState]);

  // ── Garden continue (for quote/vibe items) ──
  const handleGardenContinue = useCallback((garden, itemIndex) => {
    const currentItem = garden.items[itemIndex];
    earnSeeds(1);

    const newAnswer = {
      id: crypto.randomUUID(),
      text: currentItem.text,
      vibe: currentItem.vibe || garden.name.toLowerCase(),
      difficulty: currentItem.difficulty,
      gardenId: garden.id,
      gardenName: garden.name,
      answer: 'reflected',
      timestamp: new Date().toISOString(),
    };
    setAnswers((prev) => [...prev, newAnswer]);
    insertAnswerRow(newAnswer, 'garden');

    const newProgress = Math.max(gardenCompletions[garden.id] || 0, itemIndex + 1);
    setGardenCompletions((prev) => ({
      ...prev,
      [garden.id]: Math.max((prev[garden.id] || 0), itemIndex + 1),
    }));

    const completed = itemIndex >= garden.items.length - 1;
    upsertGardenState(garden.id, {
      unlocked: true,
      progress: newProgress,
      completed_at: completed ? new Date().toISOString() : null,
    });

    if (completed) {
      const totalDifficulty = garden.items.reduce((sum, item) => sum + item.difficulty, 0);
      const bonus = totalDifficulty * SEEDS.GARDEN_COMPLETION_MULTIPLIER;
      setSeeds((prev) => prev + bonus);
      showSeedAnimation(`+${bonus} bonus!`);
      return true;
    }
    return false;
  }, [earnSeeds, gardenCompletions, showSeedAnimation, insertAnswerRow, upsertGardenState]);

  // ── Daily 30 methods ──
  const handleDaily30Answer = useCallback((questionIndex, answer) => {
    const currentQ = dailyQuestions[questionIndex];
    earnSeeds(currentQ.difficulty);

    const newAnswer = {
      id: crypto.randomUUID(),
      text: currentQ.text,
      vibe: currentQ.vibe || 'daily',
      difficulty: currentQ.difficulty,
      answer,
      timestamp: new Date().toISOString(),
    };
    setAnswers((prev) => [...prev, newAnswer]);
    insertAnswerRow(newAnswer, 'daily30');

    setDailyAnswered((prev) => ({
      count: prev.count + 1,
      date: new Date().toISOString(),
    }));

    if (questionIndex >= 29) {
      const newStreak = dailyStreak.count + 1;
      setDailyStreak({ count: newStreak, lastDate: new Date().toISOString() });
      const streakBonus = SEEDS.DAILY_30_BASE_BONUS + (newStreak * SEEDS.DAILY_30_STREAK_MULTIPLIER);
      setSeeds((prev) => prev + streakBonus);
      showSeedAnimation(`+${streakBonus} Daily 30 bonus!`);
      return true;
    }
    return false;
  }, [dailyQuestions, dailyStreak, earnSeeds, showSeedAnimation, insertAnswerRow]);

  // ── Auth methods ──
  const login = useCallback(async (email, password) => {
    if (!supabase) return { error: 'Cilantro needs its backend keys.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: friendlyAuthError(error) };
    return {};
  }, []);

  const signup = useCallback(async ({ email, password, firstName, username }) => {
    if (!supabase) return { error: 'Cilantro needs its backend keys.' };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, username } },
    });
    if (error) return { error: friendlyAuthError(error) };
    if (!data.session) return { needsConfirmation: true };
    return {};
  }, []);

  const logout = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error('signOut failed', error);
  }, []);

  const value = {
    // Theme
    darkMode, toggleDarkMode,
    // Auth
    isLoggedIn, authLoading, user, login, signup, logout,
    // Questions
    currentQuestion, isTransitioning,
    handleAnswer, handleSkip,
    // Answers
    answers, changeAnswer,
    skippedQuestions,
    // Seeds
    seeds, seedAnimation, earnSeeds, showSeedAnimation,
    // Gardens
    gardens, gardenUnlocks, gardenCompletions,
    isGardenUnlocked, getGardenProgress,
    unlockGarden, peekGarden,
    handleGardenAnswer, handleGardenContinue,
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
