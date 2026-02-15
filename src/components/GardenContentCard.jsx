import React from 'react';
import { vibeColor } from '../data/questions';

export default function GardenContentCard({ item, gardenColor, gardenLabel, isTransitioning, onYes, onNo, onContinue, onSkip }) {
  const dotColor = gardenColor || vibeColor(item.vibe) || '#a8a29e';

  return (
    <div
      className={`transition-all duration-300 ${
        isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
      }`}
      role="region"
      aria-live="polite"
      aria-label="Current garden item"
    >
      {/* Garden label */}
      {gardenLabel && (
        <div className="flex justify-center mb-6">
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: dotColor + '20', color: dotColor }}
          >
            {gardenLabel}
          </div>
        </div>
      )}

      {/* Content based on type */}
      {item.contentType === 'question' && (
        <>
          <h2 className="text-2xl md:text-3xl font-light text-stone-700 dark:text-stone-200 text-center leading-relaxed mb-12 px-4">
            {item.text}
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
        </>
      )}

      {item.contentType === 'quote' && (
        <>
          <div className="px-6 mb-12">
            <div className="text-center mb-3">
              <span className="text-3xl text-stone-200 dark:text-stone-600 font-serif" aria-hidden="true">"</span>
            </div>
            <p className="text-xl md:text-2xl font-light text-stone-700 dark:text-stone-200 text-center leading-relaxed italic">
              {item.text}
            </p>
            {item.attribution && (
              <p className="text-sm text-stone-400 dark:text-stone-500 text-center mt-4 font-light">
                — {item.attribution}
              </p>
            )}
          </div>

          {/* Continue button */}
          <div className="px-4">
            <button
              onClick={onContinue}
              className="w-full py-5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500 rounded-2xl text-stone-600 dark:text-stone-300 font-light text-lg transition-all duration-200 shadow-sm hover:shadow active:scale-95"
              aria-label="Continue to next"
            >
              continue
            </button>
          </div>
        </>
      )}

      {item.contentType === 'vibe' && (
        <>
          <div className="px-6 mb-12">
            <div
              className="w-3 h-3 rounded-full mx-auto mb-6 opacity-40"
              style={{ backgroundColor: dotColor }}
              aria-hidden="true"
            />
            <p className="text-xl md:text-2xl font-light text-stone-700 dark:text-stone-200 text-center leading-relaxed">
              {item.text}
            </p>
          </div>

          {/* Continue button */}
          <div className="px-4">
            <button
              onClick={onContinue}
              className="w-full py-5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500 rounded-2xl text-stone-600 dark:text-stone-300 font-light text-lg transition-all duration-200 shadow-sm hover:shadow active:scale-95"
              aria-label="Continue to next"
            >
              continue
            </button>
          </div>
        </>
      )}

      {/* Skip button */}
      {onSkip && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onSkip}
            className="text-xs text-stone-300 dark:text-stone-500 hover:text-stone-400 dark:hover:text-stone-400 transition-colors font-light"
            aria-label="Skip this item"
          >
            skip
          </button>
        </div>
      )}
    </div>
  );
}
