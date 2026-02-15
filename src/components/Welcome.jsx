import React from 'react';
import { useNavigate } from 'react-router-dom';
import { typeColors } from '../data/questions';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        {/* Logo/Brand */}
        <div className="mb-12">
          <h1 className="text-5xl font-light tracking-wide text-stone-600 dark:text-stone-300 mb-3">
            cilantro
          </h1>
          <p className="text-stone-400 dark:text-stone-500 font-light">
            yes or no. find yourself.
          </p>
        </div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mb-12" aria-hidden="true">
          {Object.values(typeColors).slice(0, 6).map((color, i) => (
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
            onClick={() => navigate('/signup')}
            className="w-full py-4 bg-stone-700 hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500 text-white rounded-2xl font-light text-lg transition-all shadow-sm active:scale-[0.98]"
          >
            get started
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 rounded-2xl font-light text-lg transition-all active:scale-[0.98]"
          >
            sign in
          </button>
        </div>

        <p className="mt-8 text-xs text-stone-300 dark:text-stone-600 font-light" aria-hidden="true">
          reflect. grow. repeat.
        </p>
      </div>
    </div>
  );
}
