import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { formatTime, gardens } from '../data/questions';
import { vibeAccent } from '../theme/palettes';
import { portrait } from '../utils/portrait';
import { getQuestionMeta } from '../data/questionMeta';

export default function Profile() {
  const navigate = useNavigate();
  const {
    user, logout,
    answers, changeAnswer,
    skippedQuestions, answerSkipped,
    gardenCompletions,
    dailyAnswered, dailyStreak,
    darkMode,
  } = useCilantro();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  // Most-used topic tags across this user's reflections (top 8)
  const topTags = useMemo(() => {
    const counts = {};
    for (const a of answers) {
      for (const t of getQuestionMeta(a.text).tags) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((x, y) => y[1] - x[1])
      .slice(0, 8)
      .map(([t]) => t);
  }, [answers]);

  const filteredAnswers = answers.filter((a) => {
    if (searchQuery && !a.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeTag && !getQuestionMeta(a.text).tags.includes(activeTag)) return false;
    return true;
  });

  // Gardens the user has actually explored (started or completed). Only current
  // gardens count — stale garden_states rows for retired gardens must not inflate
  // the total.
  const gardensExplored = gardens.filter((g) => (gardenCompletions[g.id] || 0) > 0).length;
  const memberSince = user?.memberSince
    ? new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  // Portrait: a few plain sentences about where you lean and where your
  // attention goes — no scores, no verdict. Empty until ~10 reflections.
  const portraitLines = portrait(answers, skippedQuestions);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col retint">
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-sub opacity-55 hover:opacity-100 transition-opacity text-sm font-rounded font-semibold retint"
            aria-label="Go back to home"
          >
            ← back
          </button>
          <h1 className="text-2xl font-rounded font-semibold tracking-wide text-deep retint">
            profile
          </h1>
          <div className="w-12" aria-hidden="true"></div>
        </div>
      </header>

      <main className="flex-1 px-6 pb-8 overflow-auto">
        <div className="max-w-sm mx-auto">
          {/* User info */}
          {user && (
            <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-soft to-mid flex items-center justify-center retint" aria-hidden="true">
                    <span className="text-deep font-rounded font-bold text-lg">
                      {user.firstName?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-ink font-rounded font-semibold">{user.firstName}</p>
                    <p className="text-xs text-sub">
                      @{user.username}{memberSince ? ` · since ${memberSince}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); navigate('/welcome'); }}
                  className="text-xs text-sub opacity-55 hover:opacity-100 transition-opacity font-rounded font-semibold"
                >
                  sign out
                </button>
              </div>

              {/* Quick stats */}
              <div className="mt-4 pt-4 border-t border-mid grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-rounded font-semibold text-ink">{answers.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-sub">reflections</p>
                </div>
                <div>
                  <p className="text-lg font-rounded font-semibold text-ink">{gardensExplored}<span className="text-sub">/{gardens.length}</span></p>
                  <p className="text-[10px] uppercase tracking-wider text-sub">gardens explored</p>
                </div>
                <div>
                  <p className="text-lg font-rounded font-semibold text-ink">{dailyStreak.count}</p>
                  <p className="text-[10px] uppercase tracking-wider text-sub">day streak</p>
                </div>
              </div>
            </div>
          )}

          {/* Your Portrait — plain sentences, no scores */}
          {answers.length > 0 && (
            <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6 mb-6">
              <h3 className="text-xs text-sub font-rounded font-semibold uppercase tracking-wide mb-4">your portrait</h3>
              {portraitLines.length > 0 ? (
                <div className="space-y-3">
                  {portraitLines.map((line, i) => (
                    <p key={i} className="text-sm text-sub leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-sub leading-relaxed">
                  answer more questions and a portrait starts to form
                </p>
              )}
              {/* Quiet door to the opt-in graphs page */}
              <button
                onClick={() => navigate('/graphs')}
                className="mt-4 text-xs text-sub opacity-55 hover:opacity-100 transition-opacity font-rounded font-semibold retint"
                aria-label="Open your graphs"
              >
                graphs →
              </button>
            </div>
          )}

          {/* Daily 30 Section */}
          <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-rounded font-semibold text-ink">Daily 30</h3>
                <p className="text-xs text-sub mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              {dailyStreak.count > 0 && (
                <span className="text-xs bg-soft text-deep font-bold px-2 py-1 rounded-full retint">
                  🔥 {dailyStreak.count} day streak
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-2 bg-soft rounded-full overflow-hidden retint" role="progressbar" aria-valuenow={dailyAnswered.count} aria-valuemin={0} aria-valuemax={30} aria-label="Daily 30 progress">
                <div
                  className="h-full bg-accent rounded-full transition-all retint"
                  style={{ width: `${(dailyAnswered.count / 30) * 100}%` }}
                />
              </div>
              <span className="text-xs text-sub">{dailyAnswered.count}/30</span>
            </div>
            <button
              onClick={() => navigate('/daily30')}
              className="w-full py-3 bg-deep text-canvas rounded-[18px] font-rounded font-semibold text-sm shadow-ledge retint transition-all active:scale-[0.98] hover:translate-y-[2px] hover:shadow-ledge-sm disabled:hover:translate-y-0 disabled:hover:shadow-ledge"
              disabled={dailyAnswered.count >= 30}
            >
              {dailyAnswered.count === 0 ? "start today's daily 30" : dailyAnswered.count < 30 ? 'continue daily 30' : 'completed ✓'}
            </button>
          </div>

          {/* Skipped questions — "not right now" queue, answerable in place */}
          {skippedQuestions.length > 0 && (
            <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6 mb-6">
              <h3 className="text-sm text-sub font-rounded font-semibold mb-1">waiting for you ({skippedQuestions.length})</h3>
              <p className="text-xs text-sub mb-4">
                questions you skipped — answer when it feels right, or let them come back around
              </p>
              <div className="space-y-4 max-h-64 overflow-auto">
                {skippedQuestions.map((q) => (
                  <div key={q.text} className="border-b border-mid pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: vibeAccent(q.vibe, darkMode ? 'dark' : 'light') }}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink leading-relaxed">{q.text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => answerSkipped(q.text, 'yes')}
                            className="text-xs font-bold px-3 py-1 rounded-full bg-soft text-deep hover:bg-mid transition-colors retint"
                            aria-label={`Answer yes to: ${q.text}`}
                          >
                            yes
                          </button>
                          <button
                            onClick={() => answerSkipped(q.text, 'no')}
                            className="text-xs font-bold px-3 py-1 rounded-full bg-soft text-deep hover:bg-negate transition-colors retint"
                            aria-label={`Answer no to: ${q.text}`}
                          >
                            no
                          </button>
                          {q.skippedAt && (
                            <span className="text-xs text-sub ml-1">
                              skipped {formatTime(q.skippedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer Log */}
          {answers.length > 0 && (
            <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-sub font-rounded font-semibold">your reflections</h3>
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
                  className="w-full py-2 px-3 text-sm bg-soft border-2 border-mid rounded-xl text-ink placeholder-sub focus:outline-none focus:border-ink retint"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sub opacity-55 hover:opacity-100 transition-opacity"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Topic filter chips (from question hashtags) */}
              {topTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {topTags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTag(activeTag === t ? null : t)}
                      aria-pressed={activeTag === t}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors retint ${
                        activeTag === t
                          ? 'bg-deep text-canvas'
                          : 'bg-soft text-deep hover:bg-mid'
                      }`}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-auto">
                {[...filteredAnswers].reverse().map((a, i) => {
                  const actualIndex = answers.indexOf(a);
                  return (
                    <div key={i} className="border-b border-mid pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: vibeAccent(a.vibe, darkMode ? 'dark' : 'light') }}
                          aria-hidden="true"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink leading-relaxed">
                            {a.text}
                          </p>

                          {/* Garden/Daily30 tag */}
                          {a.gardenName && (
                            <span className="inline-block text-[11px] font-bold text-deep bg-soft px-2.5 py-0.5 rounded-full mt-1 retint">
                              {a.gardenName}
                            </span>
                          )}

                          {/* Current answer */}
                          <div className="flex items-center gap-3 mt-2">
                            {a.answer === 'reflected' ? (
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-soft text-sub retint">
                                reflected
                              </span>
                            ) : (
                              <button
                                onClick={() => changeAnswer(actualIndex)}
                                className="text-xs font-bold px-3 py-1 rounded-full bg-soft text-deep hover:bg-mid transition-colors retint"
                                aria-label={`Change answer from ${a.answer}`}
                              >
                                {a.answer}
                              </button>
                            )}
                            <span className="text-xs text-sub">
                              {formatTime(a.updatedAt || a.timestamp)}
                            </span>
                          </div>

                          {/* Answer history */}
                          {a.history && a.history.length > 0 && (
                            <div className="mt-2 pl-2 border-l-2 border-mid">
                              {[...a.history].reverse().map((h, hi) => (
                                <div key={hi} className="flex items-center gap-2 py-1">
                                  <span className="text-xs text-sub">
                                    {h.answer}
                                  </span>
                                  <span className="text-xs text-sub opacity-60">
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

                {filteredAnswers.length === 0 && (searchQuery || activeTag) && (
                  <p className="text-center text-sub text-sm py-4">
                    no matches found
                  </p>
                )}
              </div>
            </div>
          )}

          {answers.length === 0 && skippedQuestions.length === 0 && (
            <p className="text-center text-sub mt-12">
              no reflections yet
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
