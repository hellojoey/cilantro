import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatTime, gardens } from '../data/questions';
import { getFinePrint } from '../data/finePrint';
import { getQuestionMeta } from '../data/questionMeta';

export default function QuestionCard({ question, vibe, color, label, echo, resurfaced, isTransitioning, onYes, onNo, onSkip, skipLabel = 'skip' }) {
  const finePrint = getFinePrint(question);
  const meta = getQuestionMeta(question);
  const relatedGardens = meta.gardens
    .map((id) => gardens.find((g) => g.id === id))
    .filter(Boolean);
  const hasFinePrint = Boolean(finePrint) || meta.tags.length > 0 || relatedGardens.length > 0;

  // The chip names the question's vibe. Its color comes from the palette (which
  // is already tinted to this vibe), so no per-vibe color is computed here.
  // `color` stays supported for callers that carry their own identity color.
  const chipStyle = color ? { backgroundColor: `${color}26`, color } : undefined;

  // Fine print is opt-in per question — collapsed again on every new question
  // so quick reflection stays frictionless.
  const [showFinePrint, setShowFinePrint] = useState(false);
  useEffect(() => setShowFinePrint(false), [question]);

  return (
    <div
      className={`transition-all duration-300 ${
        isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
      }`}
      role="region"
      aria-live="polite"
      aria-label="Current question"
    >
      {/* The card */}
      <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint px-6 py-7 text-center">
        {/* Gentle note when a skipped question comes back around */}
        {resurfaced && (
          <p className="text-[11px] text-sub text-center italic mb-3 retint">
            you skipped this one before — feel any different?
          </p>
        )}

        {/* Echo: this question is returning from your past */}
        {echo && (
          <div className="flex justify-center mb-4">
            <div className="px-4 py-2 rounded-2xl bg-soft border-2 border-mid text-center retint">
              <p className="text-xs text-deep font-rounded">
                an echo — last time you said{' '}
                <span className="font-bold">{echo.previousAnswer}</span>
                <span className="text-sub"> · {formatTime(echo.previousTime)}</span>
              </p>
              <p className="text-xs text-sub mt-0.5">is it still true?</p>
            </div>
          </div>
        )}

        {/* Vibe chip */}
        {(label || vibe) && (
          <div className="flex justify-center mb-4">
            <div
              className="px-3 py-1 rounded-full text-xs font-rounded font-bold bg-soft text-deep retint"
              style={chipStyle}
            >
              {label || vibe}
            </div>
          </div>
        )}

        {/* Question */}
        <h2 className="text-2xl md:text-3xl font-rounded font-semibold text-ink text-center leading-snug mb-6 retint">
          {question}
        </h2>

        {/* Yes/No buttons */}
        <div className="flex gap-3" role="group" aria-label="Answer options">
          <button
            onClick={onYes}
            className="flex-1 py-4 bg-card border-2 border-ink rounded-[14px] text-ink font-rounded font-bold text-lg hover:bg-mid active:scale-95 transition-[background-color,transform] retint"
            aria-label="Answer yes"
          >
            yes
          </button>
          <button
            onClick={onNo}
            className="flex-1 py-4 bg-card border-2 border-ink rounded-[14px] text-ink font-rounded font-bold text-lg hover:bg-negate active:scale-95 transition-[background-color,transform] retint"
            aria-label="Answer no"
          >
            no
          </button>
        </div>

        {/* Skip button */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="block mx-auto mt-4 text-xs text-sub font-rounded font-semibold opacity-55 hover:opacity-100 transition-opacity retint"
            aria-label="Skip this question"
          >
            {skipLabel}
          </button>
        )}
      </div>

      {/* Fine print: beneath and outside the card, opt-in via toggle so it never
          distracts. Expands to clarifier + topic hashtags + garden thumbnails. */}
      {hasFinePrint && (
        <div className="mt-6 px-2 text-center">
          <button
            onClick={() => setShowFinePrint((v) => !v)}
            aria-expanded={showFinePrint}
            className="text-[10px] uppercase tracking-[0.2em] text-deep font-rounded font-extrabold hover:opacity-75 transition-opacity retint"
          >
            fine print {showFinePrint ? '−' : '+'}
          </button>
          {showFinePrint && (
            <div className="mt-2">
              {finePrint && (
                <p className="text-[13px] text-sub leading-relaxed retint">
                  {finePrint}
                </p>
              )}
              {meta.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                  {meta.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-rounded font-bold px-2.5 py-0.5 rounded-full bg-soft text-deep retint"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              {relatedGardens.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {relatedGardens.map((g) => (
                    <Link
                      key={g.id}
                      to={`/gardens/${g.id}`}
                      className="flex items-center gap-1.5 text-xs font-rounded font-bold text-ink bg-card border-2 border-ink rounded-xl px-2.5 py-1.5 shadow-chunk-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-chunk-xs transition-[transform,box-shadow] retint"
                      aria-label={`Explore the ${g.name} garden`}
                    >
                      <span
                        className="w-6 h-6 rounded-lg grid place-items-center text-xs"
                        style={{ backgroundColor: g.color + '26' }}
                        aria-hidden="true"
                      >
                        {g.icon}
                      </span>
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
