import React from 'react';
import { typeColors } from '../data/questions';

export default function QuestionCard({ question, type, color, label, isTransitioning, onYes, onNo, onSkip }) {
  const dotColor = color || typeColors[type] || '#a8a29e';

  return (
    <div
      className={`transition-all duration-300 ${
        isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
      }`}
      role="region"
      aria-live="polite"
      aria-label="Current question"
    >
      {/* Type indicator */}
      <div className="flex justify-center mb-6">
        {label ? (
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: dotColor + '20', color: dotColor }}
          >
            {label}
          </div>
        ) : (
          <div
            className="w-2 h-2 rounded-full opacity-60"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Question */}
      <h2 className="text-2xl md:text-3xl font-light text-stone-700 dark:text-stone-200 text-center leading-relaxed mb-12 px-4">
        {question}
      </h2>

      {/* Yes/No buttons */}
      <div className="flex gap-4 px-4" role="group" aria-label="Answer options">
        <button
          onClick={onYes}
          className="flex-1 py-5 bg-white dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-stone-200 dark:border-stone-600 hover:border-emerald-200 dark:hover:border-emerald-700 rounded-2xl text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-light text-lg transition-all duration-200 shadow-sm hover:shadow active:scale-95"
          aria-label="Answer yes"
        >
          yes
        </button>
        <button
          onClick={onNo}
          className="flex-1 py-5 bg-white dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 border border-stone-200 dark:border-stone-600 hover:border-rose-200 dark:hover:border-rose-700 rounded-2xl text-stone-600 dark:text-stone-300 hover:text-rose-400 dark:hover:text-rose-400 font-light text-lg transition-all duration-200 shadow-sm hover:shadow active:scale-95"
          aria-label="Answer no"
        >
          no
        </button>
      </div>

      {/* Skip button */}
      {onSkip && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onSkip}
            className="text-xs text-stone-300 dark:text-stone-500 hover:text-stone-400 dark:hover:text-stone-400 transition-colors font-light"
            aria-label="Skip this question"
          >
            skip
          </button>
        </div>
      )}
    </div>
  );
}
