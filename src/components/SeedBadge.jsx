import React from 'react';
import { useCilantro } from '../context/CilantroContext';

export default function SeedBadge({ size = 'sm' }) {
  const { seeds, seedAnimation } = useCilantro();

  if (size === 'lg') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">🌱</span>
        <span className="text-2xl font-rounded font-bold text-ink retint">{seeds}</span>
        <span className="text-sm text-sub retint">seeds</span>
        {seedAnimation && (
          <span
            className={`text-sm font-semibold animate-pulse retint ${
              seedAnimation.startsWith('-') || seedAnimation.startsWith('Not')
                ? 'text-alert'
                : 'text-deep'
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
    <div className="flex items-center gap-1 px-2 py-1 bg-card border-2 border-ink rounded-full shadow-chunk-xs retint" aria-label={`${seeds} seeds`}>
      <span className="text-sm" aria-hidden="true">🌱</span>
      <span className="text-xs font-semibold text-ink retint">{seeds}</span>
      {seedAnimation && (
        <span
          className={`text-xs font-semibold retint ${
            seedAnimation.startsWith('-') || seedAnimation.startsWith('Not')
              ? 'text-alert'
              : 'text-deep'
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
