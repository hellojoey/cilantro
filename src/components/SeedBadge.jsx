import React from 'react';
import { useCilantro } from '../context/CilantroContext';

export default function SeedBadge({ size = 'sm' }) {
  const { seeds, seedAnimation } = useCilantro();

  if (size === 'lg') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">🌱</span>
        <span className="text-2xl font-light text-stone-700 dark:text-stone-200">{seeds}</span>
        <span className="text-sm text-stone-400 dark:text-stone-500">seeds</span>
        {seedAnimation && (
          <span
            className={`text-sm font-medium animate-pulse ${
              seedAnimation.startsWith('-') || seedAnimation.startsWith('Not')
                ? 'text-rose-400'
                : 'text-emerald-500'
            }`}
            role="status"
            aria-live="polite"
          >
            {seedAnimation}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-full shadow-sm" aria-label={`${seeds} seeds`}>
      <span className="text-sm" aria-hidden="true">🌱</span>
      <span className="text-xs font-medium text-stone-500 dark:text-stone-300">{seeds}</span>
      {seedAnimation && (
        <span
          className={`text-xs font-medium ${
            seedAnimation.startsWith('-') || seedAnimation.startsWith('Not')
              ? 'text-rose-400'
              : 'text-emerald-500'
          }`}
          role="status"
          aria-live="polite"
        >
          {seedAnimation}
        </span>
      )}
    </div>
  );
}
