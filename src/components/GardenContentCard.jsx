import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gardens } from '../data/questions';
import { vibeAccent } from '../theme/palettes';
import { getFinePrint } from '../data/finePrint';
import { getQuestionMeta } from '../data/questionMeta';

export default function GardenContentCard({ item, gardenColor, gardenLabel, isTransitioning, onYes, onNo, onContinue, onSkip }) {
  // Garden identity color when present (it always is today); the vibe's family
  // accent is the fallback for any caller that doesn't carry one.
  const dotColor = gardenColor || vibeAccent(item.vibe);
  const isQuestion = item.contentType === 'question';
  const finePrint = isQuestion ? getFinePrint(item.text) : null;
  const meta = isQuestion ? getQuestionMeta(item.text) : { tags: [], gardens: [] };
  const relatedGardens = meta.gardens
    .map((id) => gardens.find((g) => g.id === id))
    .filter(Boolean);
  const hasFinePrint = Boolean(finePrint) || meta.tags.length > 0 || relatedGardens.length > 0;

  // Fine print is opt-in per item — collapsed again on every new item.
  const [showFinePrint, setShowFinePrint] = useState(false);
  useEffect(() => setShowFinePrint(false), [item.text]);

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
          <div className="bg-soft text-deep font-rounded font-bold rounded-full px-3 py-1 text-xs retint">
            {gardenLabel}
          </div>
        </div>
      )}

      {/* Content based on type */}
      {item.contentType === 'question' && (
        <>
          <h2 className="text-2xl md:text-3xl font-rounded font-semibold text-ink text-center leading-relaxed mb-12 px-4">
            {item.text}
          </h2>

          {/* Yes/No buttons */}
          <div className="flex gap-4 px-4" role="group" aria-label="Answer options">
            <button
              onClick={onYes}
              className="flex-1 py-5 border-2 border-ink bg-card hover:bg-mid text-ink rounded-[14px] font-rounded font-bold text-lg transition-all duration-200 active:scale-95 retint"
              aria-label="Answer yes"
            >
              yes
            </button>
            <button
              onClick={onNo}
              className="flex-1 py-5 border-2 border-ink bg-card hover:bg-negate text-ink rounded-[14px] font-rounded font-bold text-lg transition-all duration-200 active:scale-95 retint"
              aria-label="Answer no"
            >
              no
            </button>
          </div>

          {/* Fine print: beneath the card, opt-in via toggle so it never distracts.
              Expands to clarifier + topic hashtags + cross-garden thumbnails. */}
          {hasFinePrint && (
            <div className="mt-8 px-8 text-center">
              <button
                onClick={() => setShowFinePrint((v) => !v)}
                aria-expanded={showFinePrint}
                className="text-[10px] uppercase tracking-[0.2em] font-rounded font-semibold text-sub opacity-55 hover:opacity-100 transition-opacity"
              >
                fine print {showFinePrint ? '−' : '+'}
              </button>
              {showFinePrint && (
                <div className="mt-1.5">
                  {finePrint && (
                    <p className="text-xs text-sub leading-relaxed">
                      {finePrint}
                    </p>
                  )}
                  {meta.tags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mt-2.5">
                      {meta.tags.map((t) => (
                        <span
                          key={t}
                          className="bg-soft text-deep font-bold rounded-full px-2.5 py-0.5 text-[11px] retint"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                  {relatedGardens.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-2.5">
                      {relatedGardens.map((g) => (
                        <Link
                          key={g.id}
                          to={`/gardens/${g.id}`}
                          className="flex items-center gap-1.5 text-[11px] font-rounded font-bold text-ink bg-card border-2 border-ink rounded-xl shadow-chunk-sm retint px-2.5 py-1.5 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-chunk-xs"
                          aria-label={`Explore the ${g.name} garden`}
                        >
                          <span
                            className="w-5 h-5 rounded-md grid place-items-center text-xs"
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
        </>
      )}

      {item.contentType === 'quote' && (
        <>
          <div className="px-6 mb-12">
            <div className="text-center mb-3">
              <span className="text-3xl text-sub/40 font-rounded" aria-hidden="true">"</span>
            </div>
            <p className="text-xl md:text-2xl font-rounded font-semibold text-ink text-center leading-relaxed italic">
              {item.text}
            </p>
            {item.attribution && (
              <p className="text-sm text-sub text-center mt-4">
                — {item.attribution}
              </p>
            )}
          </div>

          {/* Continue button */}
          <div className="px-4">
            <button
              onClick={onContinue}
              className="w-full py-5 border-2 border-ink bg-card hover:bg-soft text-ink rounded-[14px] font-rounded font-bold text-lg transition-all duration-200 active:scale-95 retint"
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
            <p className="text-xl md:text-2xl font-rounded font-semibold text-ink text-center leading-relaxed">
              {item.text}
            </p>
          </div>

          {/* Continue button */}
          <div className="px-4">
            <button
              onClick={onContinue}
              className="w-full py-5 border-2 border-ink bg-card hover:bg-soft text-ink rounded-[14px] font-rounded font-bold text-lg transition-all duration-200 active:scale-95 retint"
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
            className="text-sub text-xs font-rounded font-semibold opacity-55 hover:opacity-100 transition-opacity"
            aria-label="Skip this item"
          >
            skip
          </button>
        </div>
      )}
    </div>
  );
}
