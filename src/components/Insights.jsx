import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { questions, formatTime } from '../data/questions';
import { findMirrorMoments, radarComparison, noticings } from '../utils/insights';

// Bank lookup for re-answering mirror questions
const questionById = new Map(questions.map(q => [q.id, q]));

export default function Insights() {
  const navigate = useNavigate();
  const { answers, seeds, dailyStreak, gardenCompletions, reanswer } = useCilantro();

  // ── The Mirror ──
  const mirrorMoments = findMirrorMoments(answers);
  const { trends, hasComparison } = radarComparison(answers);
  const noticingLines = noticings(answers);

  const handleRevisit = (questionId, fallbackEntry, newAnswer) => {
    const q = questionById.get(questionId) || fallbackEntry;
    reanswer(q, newAnswer);
  };

  // ── Compute stats ──
  const totalAnswered = answers.length;
  const yesCount = answers.filter(a => a.answer === 'yes').length;
  const noCount = answers.filter(a => a.answer === 'no').length;
  const yesPercent = totalAnswered > 0 ? Math.round((yesCount / totalAnswered) * 100) : 0;

  // Recent activity (last 7 days)
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentAnswers = answers.filter(a => new Date(a.timestamp) >= weekAgo);
  const recentYes = recentAnswers.filter(a => a.answer === 'yes').length;

  // Day-by-day activity (last 7 days)
  const dayActivity = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayStr = day.toISOString().split('T')[0];
    const dayAnswers = answers.filter(a => a.timestamp?.startsWith(dayStr));
    dayActivity.push({
      label: day.toLocaleDateString('en-US', { weekday: 'short' }),
      count: dayAnswers.length,
      isToday: i === 0,
    });
  }
  const maxDayCount = Math.max(...dayActivity.map(d => d.count), 1);

  // Gardens completed count
  const gardensCompleted = Object.values(gardenCompletions).filter(v => v >= 10).length;

  // Mood tendency
  const moodLabel = yesPercent >= 70 ? 'optimistic' :
    yesPercent >= 55 ? 'balanced-positive' :
    yesPercent >= 45 ? 'balanced' :
    yesPercent >= 30 ? 'contemplative' : 'introspective';

  if (totalAnswered === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 flex flex-col">
        <header className="pt-8 pb-4 px-6">
          <div className="max-w-sm mx-auto flex justify-between items-center">
            <button onClick={() => navigate('/')} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors text-sm" aria-label="Go back">← back</button>
            <h1 className="text-2xl font-light tracking-wide text-stone-400">insights</h1>
            <div className="w-12"></div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-stone-400 dark:text-stone-500 font-light">answer some questions first to see your insights</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 flex flex-col">
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/')} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors text-sm" aria-label="Go back">← back</button>
          <h1 className="text-2xl font-light tracking-wide text-stone-400">insights</h1>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="flex-1 px-6 pb-8 overflow-auto">
        <div className="max-w-sm mx-auto space-y-6">

          {/* ── Mirror Moments ── */}
          {mirrorMoments.length > 0 && (
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700">
              <h3 className="text-xs text-stone-400 font-light uppercase tracking-wide mb-1">Mirror Moments</h3>
              <p className="text-xs text-stone-300 dark:text-stone-500 font-light mb-4">
                two of your answers are looking at each other
              </p>
              <div className="space-y-5">
                {mirrorMoments.slice(0, 5).map((m, i) => (
                  <div key={`${m.pair.a}-${m.pair.b}`} className={i > 0 ? 'pt-5 border-t border-stone-50 dark:border-stone-700' : ''}>
                    <p className="text-sm text-stone-500 dark:text-stone-400 font-light italic leading-relaxed mb-3">
                      {m.pair.note}
                    </p>
                    {[
                      { id: m.pair.a, text: m.pair.aText, entry: m.aEntry },
                      { id: m.pair.b, text: m.pair.bText, entry: m.bEntry },
                    ].map((side) => (
                      <div key={side.id} className="flex items-start gap-2 mb-2 last:mb-0">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                            side.entry.answer === 'yes'
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400'
                          }`}
                        >
                          {side.entry.answer}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-stone-600 dark:text-stone-300 font-light leading-snug">
                            {side.text}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-stone-300 dark:text-stone-500">
                              {formatTime(side.entry.effectiveTime)}
                            </span>
                            <button
                              onClick={() => handleRevisit(side.id, side.entry, side.entry.answer === 'yes' ? 'no' : 'yes')}
                              className="text-xs text-stone-300 dark:text-stone-500 hover:text-stone-500 dark:hover:text-stone-300 underline decoration-stone-200 dark:decoration-stone-600 underline-offset-2 transition-colors font-light"
                              aria-label={`Change your answer to: ${side.text}`}
                            >
                              actually, {side.entry.answer === 'yes' ? 'no' : 'yes'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {mirrorMoments.length > 5 && (
                <p className="text-xs text-stone-300 dark:text-stone-500 font-light mt-4 text-center">
                  + {mirrorMoments.length - 5} more reflections waiting
                </p>
              )}
            </div>
          )}

          {/* ── Noticing ── */}
          {noticingLines.length > 0 && (
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700">
              <h3 className="text-xs text-stone-400 font-light uppercase tracking-wide mb-4">Noticing</h3>
              <div className="space-y-3">
                {noticingLines.map((line, i) => (
                  <p key={i} className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* ── Character Drift ── */}
          {hasComparison && (
            <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700">
              <h3 className="text-xs text-stone-400 font-light uppercase tracking-wide mb-1">Character Drift</h3>
              <p className="text-xs text-stone-300 dark:text-stone-500 font-light mb-4">
                last 30 days against everything before
              </p>
              <div className="grid grid-cols-2 gap-2">
                {trends.map((t) => (
                  <div key={t.dimension} className="flex items-center justify-between bg-stone-50 dark:bg-stone-700/50 rounded-xl px-3 py-2">
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-light">{t.dimension}</span>
                    {t.delta === null ? (
                      <span className="text-xs text-stone-300 dark:text-stone-600">—</span>
                    ) : (
                      <span className={`text-xs font-medium ${
                        t.delta > 5 ? 'text-emerald-500' : t.delta < -5 ? 'text-rose-400' : 'text-stone-400'
                      }`}>
                        {t.delta > 0 ? '+' : ''}{t.delta}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Overview Card ── */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700">
            <h3 className="text-xs text-stone-400 font-light uppercase tracking-wide mb-4">Your Reflection Style</h3>
            <div className="text-center mb-4">
              <div className="text-5xl font-light text-stone-700 dark:text-stone-200">{yesPercent}%</div>
              <div className="text-sm text-stone-400 mt-1">yes responses</div>
              <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                {moodLabel}
              </div>
            </div>
            <div className="flex justify-around text-center mt-4 pt-4 border-t border-stone-100 dark:border-stone-700">
              <div>
                <div className="text-2xl font-light text-stone-700 dark:text-stone-200">{totalAnswered}</div>
                <div className="text-xs text-stone-400">total</div>
              </div>
              <div>
                <div className="text-2xl font-light text-emerald-500">{yesCount}</div>
                <div className="text-xs text-stone-400">yes</div>
              </div>
              <div>
                <div className="text-2xl font-light text-rose-400">{noCount}</div>
                <div className="text-xs text-stone-400">no</div>
              </div>
            </div>
          </div>

          {/* ── Weekly Activity ── */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700">
            <h3 className="text-xs text-stone-400 font-light uppercase tracking-wide mb-4">This Week</h3>
            <div className="flex items-end justify-between gap-1 h-24 mb-2">
              {dayActivity.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      day.isToday
                        ? 'bg-gradient-to-t from-amber-400 to-amber-300'
                        : day.count > 0
                        ? 'bg-stone-300 dark:bg-stone-600'
                        : 'bg-stone-100 dark:bg-stone-700'
                    }`}
                    style={{
                      height: `${Math.max((day.count / maxDayCount) * 100, day.count > 0 ? 12 : 4)}%`,
                      minHeight: '4px',
                    }}
                    title={`${day.count} answers`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {dayActivity.map((day, i) => (
                <div key={i} className={`flex-1 text-center text-xs ${day.isToday ? 'text-amber-500 font-medium' : 'text-stone-300 dark:text-stone-500'}`}>
                  {day.label}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-700 flex justify-between text-xs text-stone-400">
              <span>{recentAnswers.length} answers this week</span>
              <span>{recentAnswers.length > 0 ? Math.round((recentYes / recentAnswers.length) * 100) : 0}% yes</span>
            </div>
          </div>

          {/* ── Milestones ── */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700">
            <h3 className="text-xs text-stone-400 font-light uppercase tracking-wide mb-4">Milestones</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🌱', label: 'Seeds', value: seeds, sub: 'earned' },
                { icon: '🔥', label: 'Streak', value: dailyStreak.count, sub: 'days' },
                { icon: '🌿', label: 'Gardens', value: gardensCompleted, sub: 'completed' },
                { icon: '💭', label: 'Reflections', value: totalAnswered, sub: 'total' },
              ].map((m, i) => (
                <div key={i} className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-3 text-center">
                  <div className="text-lg">{m.icon}</div>
                  <div className="text-xl font-light text-stone-700 dark:text-stone-200">{m.value}</div>
                  <div className="text-xs text-stone-400">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
