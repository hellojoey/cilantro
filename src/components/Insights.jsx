import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { questions, formatTime, gardens } from '../data/questions';
import { findMirrorMoments } from '../utils/insights';
import { portrait } from '../utils/portrait';

// Bank lookup for re-answering mirror questions
const questionById = new Map(questions.map(q => [q.id, q]));

export default function Insights() {
  const navigate = useNavigate();
  const { answers, skippedQuestions, dailyStreak, gardenCompletions, reanswer } = useCilantro();

  // ── The Mirror ──
  const mirrorMoments = findMirrorMoments(answers);
  const portraitLines = portrait(answers, skippedQuestions);

  const handleRevisit = (questionId, fallbackEntry, newAnswer) => {
    const q = questionById.get(questionId) || fallbackEntry;
    reanswer(q, newAnswer);
  };

  // ── Compute stats ──
  const totalAnswered = answers.length;

  // Recent activity (last 7 days)
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentAnswers = answers.filter(a => new Date(a.timestamp) >= weekAgo);

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

  // Gardens explored count — started or completed. Only current gardens count
  // (stale garden_states rows for retired gardens must not inflate it).
  const gardensExplored = gardens.filter(g => (gardenCompletions[g.id] || 0) > 0).length;

  if (totalAnswered === 0) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex flex-col retint">
        <header className="pt-8 pb-4 px-6">
          <div className="max-w-sm mx-auto flex justify-between items-center">
            <button onClick={() => navigate('/')} className="text-sub opacity-55 hover:opacity-100 transition-opacity text-sm font-rounded font-semibold retint" aria-label="Go back">← back</button>
            <h1 className="text-2xl font-rounded font-semibold tracking-wide text-deep retint">insights</h1>
            <div className="w-12"></div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-sub">answer some questions first to see your insights</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col retint">
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/')} className="text-sub opacity-55 hover:opacity-100 transition-opacity text-sm font-rounded font-semibold retint" aria-label="Go back">← back</button>
          <h1 className="text-2xl font-rounded font-semibold tracking-wide text-deep retint">insights</h1>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="flex-1 px-6 pb-8 overflow-auto">
        <div className="max-w-sm mx-auto space-y-6">

          {/* ── Mirror Moments ── */}
          {mirrorMoments.length > 0 && (
            <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6">
              <h3 className="text-xs text-sub font-rounded font-semibold uppercase tracking-wide mb-1">Mirror Moments</h3>
              <p className="text-xs text-sub mb-4">
                two of your answers are looking at each other
              </p>
              <div className="space-y-5">
                {mirrorMoments.slice(0, 5).map((m, i) => (
                  <div key={`${m.pair.a}-${m.pair.b}`} className={i > 0 ? 'pt-5 border-t border-mid' : ''}>
                    <p className="text-sm text-sub italic leading-relaxed mb-3">
                      {m.pair.note}
                    </p>
                    {[
                      { id: m.pair.a, text: m.pair.aText, entry: m.aEntry },
                      { id: m.pair.b, text: m.pair.bText, entry: m.bEntry },
                    ].map((side) => (
                      <div key={side.id} className="flex items-start gap-2 mb-2 last:mb-0">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 bg-soft text-deep retint"
                        >
                          {side.entry.answer}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink leading-snug">
                            {side.text}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-sub">
                              {formatTime(side.entry.effectiveTime)}
                            </span>
                            <button
                              onClick={() => handleRevisit(side.id, side.entry, side.entry.answer === 'yes' ? 'no' : 'yes')}
                              className="text-xs text-sub opacity-70 hover:opacity-100 underline decoration-mid underline-offset-2 transition-opacity font-rounded font-semibold"
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
                <p className="text-xs text-sub mt-4 text-center">
                  + {mirrorMoments.length - 5} more reflections waiting
                </p>
              )}
            </div>
          )}

          {/* ── Noticing ── */}
          {portraitLines.length > 0 && (
            <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6">
              <h3 className="text-xs text-sub font-rounded font-semibold uppercase tracking-wide mb-4">Noticing</h3>
              <div className="space-y-3">
                {portraitLines.map((line, i) => (
                  <p key={i} className="text-sm text-sub leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
              {/* Quiet door to the opt-in graphs page (where Character Drift lived) */}
              <button
                onClick={() => navigate('/graphs')}
                className="mt-4 text-xs text-sub opacity-55 hover:opacity-100 transition-opacity font-rounded font-semibold retint"
                aria-label="Open your graphs"
              >
                graphs →
              </button>
            </div>
          )}

          {/* ── Weekly Activity ── */}
          <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6">
            <h3 className="text-xs text-sub font-rounded font-semibold uppercase tracking-wide mb-4">This Week</h3>
            <div className="flex items-end justify-between gap-1 h-24 mb-2">
              {dayActivity.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-md transition-all retint ${
                      day.isToday
                        ? 'bg-accent'
                        : day.count > 0
                        ? 'bg-mid'
                        : 'bg-soft'
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
                <div key={i} className={`flex-1 text-center text-xs ${day.isToday ? 'text-deep font-bold' : 'text-sub'}`}>
                  {day.label}
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-mid text-xs text-sub">
              <span>{recentAnswers.length} answers this week</span>
            </div>
          </div>

          {/* ── Milestones ── */}
          <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6">
            <h3 className="text-xs text-sub font-rounded font-semibold uppercase tracking-wide mb-4">Milestones</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🔥', label: 'Streak', value: dailyStreak.count, sub: 'days' },
                { icon: '🌿', label: 'Gardens', value: gardensExplored, sub: 'explored' },
                { icon: '💭', label: 'Reflections', value: totalAnswered, sub: 'total' },
              ].map((m, i) => (
                <div key={i} className="border-2 border-ink bg-card rounded-xl shadow-chunk-sm retint p-3 text-center">
                  <div className="text-lg">{m.icon}</div>
                  <div className="text-xl font-rounded font-semibold text-ink">{m.value}</div>
                  <div className="text-xs text-sub">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
