import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { typeColors, typeLabels } from '../data/questions';

export default function Insights() {
  const navigate = useNavigate();
  const { answers, seeds, dailyStreak, gardenCompletions } = useCilantro();

  // ── Compute stats ──
  const totalAnswered = answers.length;
  const yesCount = answers.filter(a => a.answer === 'yes').length;
  const noCount = answers.filter(a => a.answer === 'no').length;
  const yesPercent = totalAnswered > 0 ? Math.round((yesCount / totalAnswered) * 100) : 0;

  // Category breakdown
  const categories = {};
  answers.forEach(a => {
    const type = a.type || 'unknown';
    if (!categories[type]) {
      categories[type] = { total: 0, yes: 0, no: 0 };
    }
    categories[type].total++;
    if (a.answer === 'yes') categories[type].yes++;
    else categories[type].no++;
  });

  // Sort categories by total answered (descending)
  const sortedCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b.total - a.total);

  // Recent activity (last 7 days)
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentAnswers = answers.filter(a => new Date(a.timestamp) >= weekAgo);
  const recentYes = recentAnswers.filter(a => a.answer === 'yes').length;
  const recentNo = recentAnswers.filter(a => a.answer === 'no').length;

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

          {/* ── Category Breakdown ── */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700">
            <h3 className="text-xs text-stone-400 font-light uppercase tracking-wide mb-4">By Category</h3>
            <div className="space-y-3">
              {sortedCategories.map(([type, data]) => {
                const yPct = Math.round((data.yes / data.total) * 100);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: typeColors[type] || '#a8a29e' }}
                        />
                        <span className="text-xs text-stone-600 dark:text-stone-300 font-light">
                          {typeLabels[type] || type}
                        </span>
                      </div>
                      <span className="text-xs text-stone-400">{data.total} · {yPct}% yes</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${yPct}%`,
                          backgroundColor: typeColors[type] || '#a8a29e',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
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
                <div key={i} className="bg-stone-50 dark:bg-stone-750 dark:bg-stone-700/50 rounded-xl p-3 text-center">
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
