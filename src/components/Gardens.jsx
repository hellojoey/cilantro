import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { gardens } from '../data/questions';
import PeekModal from './PeekModal';

export default function Gardens() {
  const navigate = useNavigate();
  const { isGardenUnlocked, getGardenProgress, unlockGarden, peekGarden } = useCilantro();
  const [peekData, setPeekData] = useState(null); // { garden, items }

  const handlePeek = (garden) => {
    const preview = peekGarden(garden);
    if (preview) {
      setPeekData({ garden, items: preview });
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-sub hover:text-ink transition-colors text-sm font-rounded font-semibold"
            aria-label="Go back to home"
          >
            ← back
          </button>
          <h1 className="text-2xl font-rounded font-semibold tracking-wide text-deep">
            gardens
          </h1>
          <div className="w-12" aria-hidden="true"></div>
        </div>
      </header>

      <main className="flex-1 px-6 pb-8 overflow-auto">
        <div className="max-w-sm mx-auto">
          <p className="text-center text-sub mb-8">
            collections for deeper reflection
          </p>

          <div className="space-y-4">
            {gardens.map((garden) => {
              const unlocked = isGardenUnlocked(garden.id);
              const progress = getGardenProgress(garden.id);
              const progressPercent = (progress / garden.items.length) * 100;

              return (
                <div
                  key={garden.id}
                  className={`w-full bg-card border-2 border-ink rounded-xl shadow-chunk-sm retint p-6 transition-all text-left hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-chunk-xs ${
                    unlocked ? '' : 'opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        !unlocked ? 'grayscale opacity-60' : ''
                      }`}
                      style={{ backgroundColor: garden.color + '26' }}
                      aria-hidden="true"
                    >
                      {unlocked ? garden.icon : '🔒'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-ink font-rounded font-semibold">{garden.name}</h3>
                      <p className="text-xs text-sub mt-1">{garden.description}</p>
                    </div>
                    {unlocked ? (
                      <button
                        onClick={() => navigate(`/gardens/${garden.id}`)}
                        className="text-sub hover:text-ink transition-colors"
                        aria-label={`Enter ${garden.name} garden`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <div
                        className="flex items-center gap-1 text-[11px] font-rounded font-bold text-deep bg-soft rounded-full px-2.5 py-0.5 retint"
                        aria-label={`Costs ${garden.seedCost} seeds`}
                      >
                        <span aria-hidden="true">🌱</span>
                        <span>{garden.seedCost}</span>
                      </div>
                    )}
                  </div>

                  {unlocked ? (
                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className="flex-1 h-1 bg-soft rounded-full overflow-hidden retint"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={garden.items.length}
                        aria-label={`${garden.name} progress`}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progressPercent}%`, backgroundColor: garden.color }}
                        />
                      </div>
                      <span className="text-xs text-sub">
                        {progress}/{garden.items.length}
                        {progress >= garden.items.length && ' ✓'}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => unlockGarden(garden)}
                        className="flex-1 py-2 bg-deep text-canvas rounded-xl text-xs font-rounded font-bold transition-all flex items-center justify-center gap-1 active:scale-[0.98] hover:opacity-90 retint"
                      >
                        <span aria-hidden="true">🌱</span> Unlock for {garden.seedCost}
                      </button>
                      <button
                        onClick={() => handlePeek(garden)}
                        className="px-3 py-2 bg-soft hover:bg-mid text-deep rounded-xl text-xs font-rounded font-semibold transition-all retint"
                      >
                        Peek (10 🌱)
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Peek Modal (replaces old alert()) */}
      {peekData && (
        <PeekModal
          garden={peekData.garden}
          items={peekData.items}
          onClose={() => setPeekData(null)}
        />
      )}
    </div>
  );
}
