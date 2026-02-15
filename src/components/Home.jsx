import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import QuestionCard from './QuestionCard';
import SeedBadge from './SeedBadge';

export default function Home() {
  const navigate = useNavigate();
  const { currentQuestion, isTransitioning, handleAnswer, handleSkip, darkMode, toggleDarkMode } = useCilantro();

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 flex flex-col">
      {/* Header with nav */}
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-light tracking-wide text-stone-400">
            cilantro
          </h1>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <SeedBadge />

            {/* Insights button */}
            <button
              onClick={() => navigate('/insights')}
              className="w-8 h-8 rounded-full bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center justify-center hover:border-stone-300 dark:hover:border-stone-500 transition-colors shadow-sm"
              aria-label="View insights"
              title="Insights"
            >
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>

            {/* Gardens button */}
            <button
              onClick={() => navigate('/gardens')}
              className="w-8 h-8 rounded-full bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center justify-center hover:border-stone-300 dark:hover:border-stone-500 transition-colors shadow-sm"
              aria-label="Open gardens"
              title="Gardens"
            >
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-10a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4z" />
                <rect x="5" y="11" width="14" height="10" rx="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 rounded-full bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center justify-center hover:border-stone-300 dark:hover:border-stone-500 transition-colors shadow-sm"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? (
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Profile button */}
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center justify-center hover:border-stone-300 dark:hover:border-stone-500 transition-colors shadow-sm"
              aria-label="Open profile"
              title="Profile"
            >
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {/* Question area */}
      <main className="flex-1 flex items-center justify-center px-6 pb-8">
        <div className="max-w-sm w-full">
          <QuestionCard
            question={currentQuestion.text}
            vibe={currentQuestion.vibe}
            isTransitioning={isTransitioning}
            onYes={() => handleAnswer('yes')}
            onNo={() => handleAnswer('no')}
            onSkip={handleSkip}
          />
        </div>
      </main>
    </div>
  );
}
