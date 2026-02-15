import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { vibeColor, formatTime, radarDimensions, calculateRadarScores } from '../data/questions';
import SeedBadge from './SeedBadge';
import RadarChart from './RadarChart';

export default function Profile() {
  const navigate = useNavigate();
  const {
    user, logout,
    answers, changeAnswer,
    skippedQuestions,
    dailyAnswered, dailyStreak,
  } = useCilantro();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredAnswers = searchQuery
    ? answers.filter(a => a.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : answers;

  // Radar chart scores
  const radarScores = calculateRadarScores(answers);

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
            profile
          </h1>
          <div className="w-12" aria-hidden="true"></div>
        </div>
      </header>

      <main className="flex-1 px-6 pb-8 overflow-auto">
        <div className="max-w-sm mx-auto">
          {/* User info */}
          {user && (
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-600 dark:to-stone-700 flex items-center justify-center" aria-hidden="true">
                    <span className="text-stone-500 dark:text-stone-300 font-light text-lg">
                      {user.firstName?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-stone-600 dark:text-stone-200 font-light">{user.firstName}</p>
                    <p className="text-xs text-stone-300 dark:text-stone-500">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); navigate('/welcome'); }}
                  className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                >
                  sign out
                </button>
              </div>

              {/* Seeds display */}
              <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-700">
                <SeedBadge size="lg" />
              </div>
            </div>
          )}

          {/* Radar Chart — Your Character */}
          {answers.length > 0 && (
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700 mb-6">
              <h3 className="text-xs text-stone-400 font-light uppercase tracking-wide mb-2 text-center">your character</h3>
              <RadarChart
                dimensions={radarDimensions}
                scores={radarScores}
                size={280}
              />
              {radarScores.every(s => s === null) && (
                <p className="text-xs text-stone-300 dark:text-stone-500 text-center mt-2 font-light">
                  answer more questions to reveal your character
                </p>
              )}
            </div>
          )}

          {/* Daily 30 Section */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-stone-600 dark:text-stone-300">Daily 30</h3>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              {dailyStreak.count > 0 && (
                <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full">
                  🔥 {dailyStreak.count} day streak
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={dailyAnswered.count} aria-valuemin={0} aria-valuemax={30} aria-label="Daily 30 progress">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                  style={{ width: `${(dailyAnswered.count / 30) * 100}%` }}
                />
              </div>
              <span className="text-xs text-stone-400 dark:text-stone-500">{dailyAnswered.count}/30</span>
            </div>
            <button
              onClick={() => navigate('/daily30')}
              className="w-full py-3 bg-stone-700 hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500 text-white rounded-xl font-light text-sm transition-all active:scale-[0.98]"
              disabled={dailyAnswered.count >= 30}
            >
              {dailyAnswered.count === 0 ? "start today's daily 30" : dailyAnswered.count < 30 ? 'continue daily 30' : 'completed ✓'}
            </button>
          </div>

          {/* Skipped questions */}
          {skippedQuestions.length > 0 && (
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700 mb-6">
              <h3 className="text-sm text-stone-400 mb-4 font-light">skipped ({skippedQuestions.length})</h3>
              <div className="space-y-3 max-h-48 overflow-auto">
                {skippedQuestions.map((q, i) => (
                  <p key={i} className="text-sm text-stone-500 dark:text-stone-400 font-light">{q.text}</p>
                ))}
              </div>
            </div>
          )}

          {/* Answer Log */}
          {answers.length > 0 && (
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-stone-400 font-light">your reflections</h3>
              </div>

              {/* Search input */}
              <div className="relative mb-4">
                <label htmlFor="search-reflections" className="sr-only">Search reflections</label>
                <input
                  id="search-reflections"
                  type="text"
                  placeholder="search reflections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 px-3 text-sm bg-stone-50 dark:bg-stone-700 border border-stone-100 dark:border-stone-600 rounded-xl text-stone-600 dark:text-stone-200 placeholder-stone-300 dark:placeholder-stone-500 focus:outline-none focus:border-stone-200 dark:focus:border-stone-500 font-light"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 dark:text-stone-500 hover:text-stone-400 dark:hover:text-stone-400"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="space-y-4 max-h-96 overflow-auto">
                {[...filteredAnswers].reverse().map((a, i) => {
                  const actualIndex = answers.indexOf(a);
                  return (
                    <div key={i} className="border-b border-stone-50 dark:border-stone-700 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: vibeColor(a.vibe || 'reflection') }}
                          aria-hidden="true"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed">
                            {a.text}
                          </p>

                          {/* Garden/Daily30 tag */}
                          {a.gardenName && (
                            <span className="inline-block text-xs text-stone-400 bg-stone-50 dark:bg-stone-700 px-2 py-0.5 rounded-full mt-1">
                              {a.gardenName}
                            </span>
                          )}

                          {/* Current answer */}
                          <div className="flex items-center gap-3 mt-2">
                            {a.answer === 'reflected' ? (
                              <span className="text-xs font-medium px-3 py-1 rounded-full bg-stone-50 dark:bg-stone-700 text-stone-400 dark:text-stone-500">
                                reflected
                              </span>
                            ) : (
                              <button
                                onClick={() => changeAnswer(actualIndex)}
                                className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                                  a.answer === 'yes'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                                    : 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                                }`}
                                aria-label={`Change answer from ${a.answer} (costs 5 seeds)`}
                              >
                                {a.answer}
                              </button>
                            )}
                            <span className="text-xs text-stone-300 dark:text-stone-500">
                              {formatTime(a.updatedAt || a.timestamp)}
                            </span>
                          </div>

                          {/* Answer history */}
                          {a.history && a.history.length > 0 && (
                            <div className="mt-2 pl-2 border-l-2 border-stone-100 dark:border-stone-700">
                              {[...a.history].reverse().map((h, hi) => (
                                <div key={hi} className="flex items-center gap-2 py-1">
                                  <span className={`text-xs ${
                                    h.answer === 'yes' ? 'text-emerald-400' : 'text-rose-300 dark:text-rose-400'
                                  }`}>
                                    {h.answer}
                                  </span>
                                  <span className="text-xs text-stone-200 dark:text-stone-600">
                                    {formatTime(h.timestamp)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredAnswers.length === 0 && searchQuery && (
                  <p className="text-center text-stone-300 dark:text-stone-500 text-sm font-light py-4">
                    no matches found
                  </p>
                )}
              </div>
            </div>
          )}

          {answers.length === 0 && skippedQuestions.length === 0 && (
            <p className="text-center text-stone-400 dark:text-stone-500 font-light mt-12">
              no reflections yet
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
