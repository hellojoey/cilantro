import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { gardens } from '../data/questions';

export default function Gardens() {
  const navigate = useNavigate();
  const { getGardenProgress } = useCilantro();

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
            pick a topic and explore where you land
          </p>

          <div className="space-y-4">
            {gardens.map((garden) => {
              const progress = getGardenProgress(garden.id);
              const total = garden.items.length;
              const started = progress > 0;
              const complete = progress >= total;
              const progressPercent = (progress / total) * 100;

              return (
                <button
                  key={garden.id}
                  onClick={() => navigate(`/gardens/${garden.id}`)}
                  className="w-full bg-card border-2 border-ink rounded-xl shadow-chunk-sm retint p-6 transition-all text-left hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-chunk-xs"
                  aria-label={`Explore the ${garden.name} garden`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: garden.color + '26' }}
                      aria-hidden="true"
                    >
                      {garden.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-ink font-rounded font-semibold">{garden.name}</h3>
                      <p className="text-xs text-sub mt-1">{garden.description}</p>
                    </div>
                    <span className="text-sub" aria-hidden="true">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>

                  {started && (
                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className="flex-1 h-1 bg-soft rounded-full overflow-hidden retint"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={total}
                        aria-label={`${garden.name} progress`}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progressPercent}%`, backgroundColor: garden.color }}
                        />
                      </div>
                      <span className="text-xs text-sub">
                        {progress}/{total}
                        {complete && ' ✓'}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
