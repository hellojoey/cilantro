import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { radarDimensions } from '../data/questions';
import { findMirrorMoments, radarComparison } from '../utils/insights';
import { topicsOf } from '../utils/portrait';
import RadarChart from './RadarChart';

// Graphs — the opt-in door. Every lens here describes, it doesn't grade.
// The six-virtue radar survives, but only at the bottom, collapsed, clearly
// not the headline. Charts are hand-rolled (divs/dots) to match the app.
export default function Graphs() {
  const navigate = useNavigate();
  const { answers, skippedQuestions } = useCilantro();
  const [radarOpen, setRadarOpen] = useState(false);

  // ── 1. Yes / no lean by topic ──
  // An answer counts toward each of its topics; topics with < 5 answers drop.
  const leanTally = new Map(); // topic → { yes, total }
  answers
    .filter((a) => a.answer === 'yes' || a.answer === 'no')
    .forEach((a) => {
      topicsOf(a).forEach((topic) => {
        const t = leanTally.get(topic) || { yes: 0, total: 0 };
        if (a.answer === 'yes') t.yes++;
        t.total++;
        leanTally.set(topic, t);
      });
    });
  const topicLeans = [...leanTally.entries()]
    .filter(([, t]) => t.total >= 5)
    .map(([topic, t]) => ({ topic, yesPct: Math.round((t.yes / t.total) * 100), total: t.total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // ── 2. What waits (skips) by topic ── current queue, not a lifetime rate.
  const waitTally = new Map();
  skippedQuestions.forEach((s) => {
    topicsOf(s, { vibeFallback: true }).forEach((topic) =>
      waitTally.set(topic, (waitTally.get(topic) || 0) + 1)
    );
  });
  const waits = [...waitTally.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxWait = Math.max(...waits.map((w) => w.count), 1);

  // ── 3. Contradiction density by topic ──
  // Each fired mirror moment counts once toward every topic either of its two
  // questions touches.
  const tensionTally = new Map();
  findMirrorMoments(answers).forEach((m) => {
    const topics = new Set([...topicsOf(m.aEntry), ...topicsOf(m.bEntry)]);
    topics.forEach((topic) => tensionTally.set(topic, (tensionTally.get(topic) || 0) + 1));
  });
  const tensions = [...tensionTally.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // ── 4. Drift by topic ── changed-answer counts (answers carrying history).
  const driftTally = new Map();
  answers
    .filter((a) => a.history && a.history.length > 0)
    .forEach((a) => {
      topicsOf(a).forEach((topic) => driftTally.set(topic, (driftTally.get(topic) || 0) + 1));
    });
  const drifts = [...driftTally.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxDrift = Math.max(...drifts.map((d) => d.count), 1);

  // ── 5. The old radar ── (the only place virtue axes appear)
  const { allTime, baseline, current, hasComparison } = radarComparison(answers);
  const radarScores = hasComparison ? current : allTime;

  if (answers.length === 0) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex flex-col retint">
        <header className="pt-8 pb-4 px-6">
          <div className="max-w-sm mx-auto flex justify-between items-center">
            <button onClick={() => navigate('/profile')} className="text-sub opacity-55 hover:opacity-100 transition-opacity text-sm font-rounded font-semibold retint" aria-label="Go back">← back</button>
            <h1 className="text-2xl font-rounded font-semibold tracking-wide text-deep retint">graphs</h1>
            <div className="w-12"></div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-sub">answer some questions first and these lenses fill in</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col retint">
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/profile')} className="text-sub opacity-55 hover:opacity-100 transition-opacity text-sm font-rounded font-semibold retint" aria-label="Go back">← back</button>
          <h1 className="text-2xl font-rounded font-semibold tracking-wide text-deep retint">graphs</h1>
          <div className="w-12"></div>
        </div>
        <p className="max-w-sm mx-auto text-xs text-sub mt-2 text-center">
          lenses you picked up on purpose — they describe, they don't grade
        </p>
      </header>

      <main className="flex-1 px-6 pb-8 overflow-auto">
        <div className="max-w-sm mx-auto space-y-6">

          {/* ── 1. Yes / no lean by topic ── */}
          <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6">
            <h3 className="text-xs text-sub font-rounded font-semibold uppercase tracking-wide mb-1">yes / no lean by topic</h3>
            <div className="flex items-center gap-4 text-xs text-sub mb-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-mid retint" aria-hidden="true" /> no
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-accent retint" aria-hidden="true" /> yes
              </span>
            </div>
            {topicLeans.length > 0 ? (
              <div className="space-y-3">
                {topicLeans.map((t) => (
                  <div key={t.topic}>
                    <div className="flex justify-between text-xs text-sub mb-1">
                      <span className="truncate pr-2">{t.topic}</span>
                      <span className="flex-shrink-0">{t.total}</span>
                    </div>
                    <div
                      className="flex h-3 rounded-full overflow-hidden bg-soft retint"
                      role="img"
                      aria-label={`${t.topic}: ${t.yesPct}% yes, ${100 - t.yesPct}% no across ${t.total} answers`}
                    >
                      <div className="h-full bg-mid" style={{ width: `${100 - t.yesPct}%` }} />
                      <div className="h-full bg-accent" style={{ width: `${t.yesPct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-sub leading-relaxed">not enough answers on any one topic yet</p>
            )}
          </div>

          {/* ── 2. What waits ── */}
          <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6">
            <h3 className="text-xs text-sub font-rounded font-semibold uppercase tracking-wide mb-1">what waits</h3>
            <p className="text-xs text-sub mb-4">what you're not answering yet</p>
            {waits.length > 0 ? (
              <div className="space-y-2">
                {waits.map((w) => (
                  <div key={w.topic} className="flex items-center gap-2">
                    <span className="text-xs text-sub w-24 truncate flex-shrink-0">{w.topic}</span>
                    <div className="flex-1 h-3 bg-soft rounded-full overflow-hidden retint">
                      <div className="h-full bg-mid rounded-full retint" style={{ width: `${(w.count / maxWait) * 100}%` }} />
                    </div>
                    <span className="text-xs text-sub w-5 text-right flex-shrink-0">{w.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-sub leading-relaxed">nothing waiting right now</p>
            )}
          </div>

          {/* ── 3. Contradiction density by topic ── */}
          <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6">
            <h3 className="text-xs text-sub font-rounded font-semibold uppercase tracking-wide mb-1">where you disagree with yourself</h3>
            <p className="text-xs text-sub mb-4">contradictions grouped by topic</p>
            {tensions.length > 0 ? (
              <div className="space-y-2">
                {tensions.map((t) => (
                  <div key={t.topic} className="flex items-center gap-2">
                    <span className="text-xs text-sub w-24 truncate flex-shrink-0">{t.topic}</span>
                    <div className="flex-1 flex flex-wrap gap-1">
                      {Array.from({ length: t.count }).map((_, i) => (
                        <span key={i} className="w-2 h-2 rounded-full bg-negate retint" aria-hidden="true" />
                      ))}
                    </div>
                    <span className="text-xs text-sub w-5 text-right flex-shrink-0">{t.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-sub leading-relaxed">no answers are disagreeing right now</p>
            )}
          </div>

          {/* ── 4. Drift by topic ── */}
          <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6">
            <h3 className="text-xs text-sub font-rounded font-semibold uppercase tracking-wide mb-1">what's moved</h3>
            <p className="text-xs text-sub mb-4">answers you've changed, by topic</p>
            {drifts.length > 0 ? (
              <div className="space-y-2">
                {drifts.map((d) => (
                  <div key={d.topic} className="flex items-center gap-2">
                    <span className="text-xs text-sub w-24 truncate flex-shrink-0">{d.topic}</span>
                    <div className="flex-1 h-3 bg-soft rounded-full overflow-hidden retint">
                      <div className="h-full bg-accent rounded-full retint" style={{ width: `${(d.count / maxDrift) * 100}%` }} />
                    </div>
                    <span className="text-xs text-sub w-5 text-right flex-shrink-0">{d.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-sub leading-relaxed">nothing has moved yet — re-answers will show up here</p>
            )}
          </div>

          {/* ── 5. The old radar — collapsed, opt-in ── */}
          <div className="bg-card border-2 border-ink rounded-chunk shadow-chunk retint p-6">
            <button
              onClick={() => setRadarOpen((o) => !o)}
              className="w-full flex items-center justify-between text-left"
              aria-expanded={radarOpen}
            >
              <h3 className="text-xs text-sub font-rounded font-semibold uppercase tracking-wide">the six-virtue radar (the old lens)</h3>
              <span className="text-sub text-sm ml-2 flex-shrink-0" aria-hidden="true">{radarOpen ? '−' : '+'}</span>
            </button>
            {radarOpen && (
              <div className="mt-4">
                <RadarChart
                  dimensions={radarDimensions}
                  scores={radarScores}
                  compareScores={hasComparison ? baseline : null}
                  size={280}
                />
                {hasComparison && (
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs text-sub">
                      <span className="inline-block w-4 border-t-2 border-accent" aria-hidden="true" /> now
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-sub">
                      <span className="inline-block w-4 border-t-2 border-dashed border-sub" aria-hidden="true" /> then
                    </span>
                  </div>
                )}
                {radarScores.every((s) => s === null) && (
                  <p className="text-xs text-sub text-center mt-2">
                    answer more questions to fill this in
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
