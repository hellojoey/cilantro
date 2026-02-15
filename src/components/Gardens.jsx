import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { gardens } from '../data/questions';
import PeekModal from './PeekModal';

export default function Gardens() {
  const navigate = useNavigate();
  const { isGardenUnlocked, getGardenProgress, unlockGarden, peekGarden } = useCilantro();
  const [peekData, setPeekData] = useState(null); // { garden, questions }

  const handlePeek = (garden) => {
    const preview = peekGarden(garden);
    if (preview) {
      setPeekData({ garden, questions: preview });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 flex flex-col">
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors text-sm"
            aria-label="Go back to home"
          >
            ← back
          </button>
          <h1 className="text-2xl font-light tracking-wide text-stone-400">
            gardens
          </h1>
          <div className="w-12" aria-hidden="true"></div>
        </div>
      </header>

      <main className="flex-1 px-6 pb-8 overflow-auto">
        <div className="max-w-sm mx-auto">
          <p className="text-center text-stone-400 dark:text-stone-500 font-light mb-8">
            collections for deeper reflection
          </p>

          <div className="space-y-4">
            {gardens.map((garden) => {
              const unlocked = isGardenUnlocked(garden.id);
              const progress = getGardenProgress(garden.id);
              const progressPercent = (progress / garden.questions.length) * 100;

              return (
                <div
                  key={garden.id}
                  className={`w-full bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border transition-all text-left ${
                    unlocked ? 'border-stone-100 dark:border-stone-700 hover:border-stone-200 dark:hover:border-stone-600' : 'border-stone-100 dark:border-stone-700 opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        !unlocked ? 'grayscale opacity-60' : ''
                      }`}
                      style={{ backgroundColor: garden.color + '20' }}
                      aria-hidden="true"
                    >
                      {unlocked ? garden.icon : '🔒'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-stone-700 dark:text-stone-200 font-medium">{garden.name}</h3>
                      <p className="text-xs text-stone-400 dark:text-stone-500 font-light mt-1">{garden.description}</p>
                    </div>
                    {unlocked ? (
                      <button
                        onClick={() => navigate(`/gardens/${garden.id}`)}
                        className="text-stone-300 dark:text-stone-500 hover:text-stone-500 dark:hover:text-stone-300 transition-colors"
                        aria-label={`Enter ${garden.name} garden`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500" aria-label={`Costs ${garden.seedCost} seeds`}>
                        <span aria-hidden="true">🌱</span>
                        <span>{garden.seedCost}</span>
                      </div>
                    )}
                  </div>

                  {unlocked ? (
                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className="flex-1 h-1 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={garden.questions.length}
                        aria-label={`${garden.name} progress`}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progressPercent}%`, backgroundColor: garden.color }}
                        />
                      </div>
                      <span className="text-xs text-stone-300 dark:text-stone-500">
                        {progress}/{garden.questions.length}
                        {progress >= garden.questions.length && ' ✓'}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => unlockGarden(garden)}
                        className="flex-1 py-2 bg-stone-700 hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500 text-white rounded-xl text-xs font-light transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
                      >
                        <span aria-hidden="true">🌱</span> Unlock for {garden.seedCost}
                      </button>
                      <button
                        onClick={() => handlePeek(garden)}
                        className="px-3 py-2 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-600 dark:text-stone-300 rounded-xl text-xs font-light transition-all"
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
          questions={peekData.questions}
          onClose={() => setPeekData(null)}
        />
      )}
    </div>
  );
}
