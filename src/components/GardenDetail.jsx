import React, { useState } from 'react';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { gardens } from '../data/questions';
import { getPostsByTopic } from '../data/blog';
import { firstUnansweredIndex } from '../utils/gardenCoverage';
import { gardenVerdict } from '../utils/gardenVerdict';
import GardenContentCard from './GardenContentCard';

// GardenDetail is a small view-mode machine over one garden's coverage:
//
//   overview ──tap branch──▶ flow ──past last item──▶ overview (rooted)
//        │                                       └──▶ /gardens (rootless)
//        ├──tap unlocked root──▶ root-readback ──continue──▶ root-question
//        │                                                       │
//        │                                              answer yes/no
//        │                                                       ▼
//        └──tap answered root──────────────────────────▶ root-closing
//
// Rootless single-branch gardens (goat/afterlife/gaza) skip the overview and
// open straight into the flow, exactly like today. Everything except the local
// view/branch/index state is DERIVED from coverage each render, so answering an
// item (which updates context answers) re-derives progress, unlock, and verdict.
// The route component remounts the view per garden id — cross-garden links
// (fine print's related gardens) would otherwise carry view/branch/index state
// from one garden into the next.
export default function GardenDetail() {
  const { gardenId } = useParams();
  return <GardenView key={gardenId} gardenId={gardenId} />;
}

function GardenView({ gardenId }) {
  const navigate = useNavigate();
  const {
    getGardenCoverage,
    handleGardenAnswer,
    handleGardenContinue,
    handleGardenRootAnswer,
    answers,
  } = useCilantro();

  const garden = gardens.find((g) => g.id === gardenId);

  // Derived shape (safe when garden is missing — hooks below stay unconditional).
  const nonEmptyBranches = garden ? garden.branches.filter((b) => b.items.length > 0) : [];
  const hasOverview = garden ? (Boolean(garden.root) || nonEmptyBranches.length > 1) : false;

  // view: 'overview' | 'flow' | 'root-readback' | 'root-question' | 'root-closing'
  const [view, setView] = useState(hasOverview ? 'overview' : 'flow');
  const [branchKey, setBranchKey] = useState(() =>
    hasOverview ? null : (nonEmptyBranches[0]?.key ?? null)
  );
  const [index, setIndex] = useState(() => {
    if (hasOverview || !nonEmptyBranches[0] || !garden) return 0;
    return firstUnansweredIndex(nonEmptyBranches[0], getGardenCoverage(garden.id).answeredIds);
  });
  const [localTransitioning, setLocalTransitioning] = useState(false);
  // Revisiting an already-answered root shows the branch readback alongside the
  // closing line; the fresh post-answer screen lands on just the closing punch.
  const [rootRevisit, setRootRevisit] = useState(false);

  // Guard: unknown garden id → redirect back to the gardens list.
  if (!garden) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6">
        <p className="text-sub mb-4">Garden not available</p>
        <button
          onClick={() => navigate('/gardens')}
          className="text-sm text-ink hover:text-deep underline font-rounded font-semibold"
        >
          back to gardens
        </button>
      </div>
    );
  }

  const coverage = getGardenCoverage(garden.id);
  const rooted = Boolean(garden.root);
  const overallDone = coverage.answered + (rooted && coverage.rootAnswer ? 1 : 0);
  const overallTotal = coverage.total + (rooted ? 1 : 0);
  const overallPercent = overallTotal > 0 ? (overallDone / overallTotal) * 100 : 0;

  // Cross-link to the blog when notes exist for this garden's topic.
  const relatedPosts = getPostsByTopic(garden.id);
  const notesHref = relatedPosts.length === 1 ? `/blog/${relatedPosts[0].slug}` : '/blog';
  const notesLink =
    relatedPosts.length > 0 ? (
      <Link
        to={notesHref}
        className="text-xs text-sub opacity-55 hover:opacity-100 transition-opacity font-rounded font-semibold retint"
        aria-label="Read the notes on this topic"
      >
        read the notes →
      </Link>
    ) : null;

  const activeBranch = branchKey ? garden.branches.find((b) => b.key === branchKey) : null;

  // ── Navigation helpers ──
  const enterBranch = (key) => {
    const branch = garden.branches.find((b) => b.key === key);
    if (!branch || branch.items.length === 0) return;
    setBranchKey(key);
    setIndex(firstUnansweredIndex(branch, coverage.answeredIds));
    setView('flow');
  };

  // Leaving the flow returns to the overview for rooted/multi-branch gardens, and
  // out to the gardens list for a rootless single-branch garden (today's feel).
  const leaveFlow = () => {
    if (hasOverview) {
      setBranchKey(null);
      setView('overview');
    } else {
      navigate('/gardens');
    }
  };

  const advanceInFlow = () => {
    if (!activeBranch || index >= activeBranch.items.length - 1) {
      leaveFlow();
    } else {
      setIndex((i) => i + 1);
    }
  };

  // ── Flow handlers (card advances keep the 400/300ms beat) ──
  const onAnswer = (answer) => {
    const item = activeBranch.items[index];
    setLocalTransitioning(true);
    handleGardenAnswer(garden, item, answer);
    setTimeout(() => {
      advanceInFlow();
      setLocalTransitioning(false);
    }, 400);
  };

  const onContinue = () => {
    const item = activeBranch.items[index];
    setLocalTransitioning(true);
    handleGardenContinue(garden, item);
    setTimeout(() => {
      advanceInFlow();
      setLocalTransitioning(false);
    }, 400);
  };

  const onSkip = () => {
    setLocalTransitioning(true);
    setTimeout(() => {
      advanceInFlow();
      setLocalTransitioning(false);
    }, 300);
  };

  // ── Root handlers ──
  const openRoot = () => {
    if (coverage.rootAnswer) {
      setRootRevisit(true);
      setView('root-closing');
    } else if (coverage.rootUnlocked) {
      setRootRevisit(false);
      setView('root-readback');
    }
  };

  const onRootAnswer = (answer) => {
    setLocalTransitioning(true);
    handleGardenRootAnswer(garden, answer);
    setTimeout(() => {
      setRootRevisit(false);
      setView('root-closing');
      setLocalTransitioning(false);
    }, 400);
  };

  // ── FLOW VIEW ──
  if (view === 'flow') {
    if (!activeBranch) {
      // Defensive: branch vanished — declarative redirect (no side effects in render).
      return <Navigate to="/gardens" replace />;
    }
    const branchTotal = activeBranch.items.length;
    const currentItem = activeBranch.items[index];
    const progress = ((index + 1) / branchTotal) * 100;

    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <header className="pt-8 pb-4 px-6">
          <div className="max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={leaveFlow}
                className="text-sub hover:text-ink transition-colors text-sm font-rounded font-semibold"
                aria-label={hasOverview ? 'Back to garden overview' : 'Exit garden'}
              >
                {hasOverview ? '← back' : '← exit garden'}
              </button>
              <span
                className="text-xs text-sub"
                aria-label={`Item ${index + 1} of ${branchTotal}`}
              >
                {index + 1} / {branchTotal}
              </span>
            </div>
            <div
              className="h-1 bg-soft rounded-full overflow-hidden retint"
              role="progressbar"
              aria-valuenow={index + 1}
              aria-valuemin={0}
              aria-valuemax={branchTotal}
              aria-label={`${garden.name} progress`}
            >
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%`, backgroundColor: garden.color }}
              />
            </div>
            {notesLink && <div className="mt-3">{notesLink}</div>}
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="max-w-sm w-full">
            <GardenContentCard
              item={currentItem}
              gardenColor={garden.color}
              gardenLabel={`${garden.icon} ${garden.name}`}
              isTransitioning={localTransitioning}
              onYes={() => onAnswer('yes')}
              onNo={() => onAnswer('no')}
              onContinue={onContinue}
              onSkip={onSkip}
            />
          </div>
        </main>
      </div>
    );
  }

  // ── ROOT READBACK (screen 1) ──
  if (view === 'root-readback') {
    const verdict = gardenVerdict(garden, answers);
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <header className="pt-8 pb-4 px-6">
          <div className="max-w-sm mx-auto flex justify-between items-center">
            <button
              onClick={() => setView('overview')}
              className="text-sub hover:text-ink transition-colors text-sm font-rounded font-semibold"
              aria-label="Back to garden overview"
            >
              ← back
            </button>
            <div className="w-12" aria-hidden="true" />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <div className="max-w-sm w-full">
            <h2 className="text-2xl font-rounded font-semibold text-deep text-center mb-8">
              where you've been landing
            </h2>
            <div
              className="bg-card border-2 border-ink rounded-xl shadow-chunk-sm retint p-6 space-y-3"
              style={{ borderColor: garden.color }}
            >
              {verdict.branchLines.map((b) => (
                <p key={b.key} className="text-sm text-ink leading-relaxed">
                  {b.line}
                </p>
              ))}
            </div>
            {verdict.preRootLine && (
              <p className="text-sm text-sub leading-relaxed text-center mt-6">
                {verdict.preRootLine}
              </p>
            )}
            <button
              onClick={() => setView('root-question')}
              className="mt-8 w-full py-5 border-2 border-ink bg-card hover:bg-mid text-ink rounded-[14px] font-rounded font-bold text-lg transition-all duration-200 active:scale-95 retint"
              aria-label="Continue to the root question"
            >
              continue
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── ROOT QUESTION (screen 2) — yes/no only, no skip ──
  if (view === 'root-question') {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <header className="pt-8 pb-4 px-6">
          <div className="max-w-sm mx-auto flex justify-between items-center">
            <button
              onClick={() => setView('root-readback')}
              className="text-sub hover:text-ink transition-colors text-sm font-rounded font-semibold"
              aria-label="Back to the readback"
            >
              ← back
            </button>
            <span className="text-xs text-sub">the root question</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="max-w-sm w-full">
            <GardenContentCard
              item={{ ...garden.root, contentType: garden.root.contentType || 'question' }}
              gardenColor={garden.color}
              gardenLabel={`${garden.icon} ${garden.name}`}
              isTransitioning={localTransitioning}
              onYes={() => onRootAnswer('yes')}
              onNo={() => onRootAnswer('no')}
              onContinue={() => {}}
              onSkip={null}
            />
          </div>
        </main>
      </div>
    );
  }

  // ── ROOT CLOSING (screen 3) — fresh answer or revisit ──
  if (view === 'root-closing') {
    const verdict = gardenVerdict(garden, answers);
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <header className="pt-8 pb-4 px-6">
          <div className="max-w-sm mx-auto flex justify-between items-center">
            <button
              onClick={() => setView('overview')}
              className="text-sub hover:text-ink transition-colors text-sm font-rounded font-semibold"
              aria-label="Back to garden overview"
            >
              ← back
            </button>
            <div className="w-12" aria-hidden="true" />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
          <div className="max-w-sm w-full">
            {rootRevisit && verdict.branchLines.length > 0 && (
              <div
                className="bg-card border-2 border-ink rounded-xl shadow-chunk-sm retint p-6 space-y-3 mb-6"
                style={{ borderColor: garden.color }}
              >
                {verdict.branchLines.map((b) => (
                  <p key={b.key} className="text-sm text-ink leading-relaxed">
                    {b.line}
                  </p>
                ))}
              </div>
            )}
            {verdict.closingLine && (
              <p className="text-lg text-ink font-rounded leading-relaxed text-center">
                {verdict.closingLine}
              </p>
            )}
            <div className="flex justify-center mt-10">
              <Link
                to="/gardens"
                className="text-sm text-sub hover:text-ink transition-colors font-rounded font-semibold"
                aria-label="Back to gardens"
              >
                back to gardens
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── OVERVIEW VIEW (default for rooted / multi-branch gardens) ──
  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-sm mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/gardens')}
            className="text-sub hover:text-ink transition-colors text-sm font-rounded font-semibold"
            aria-label="Exit garden"
          >
            ← exit garden
          </button>
          <div className="w-12" aria-hidden="true" />
        </div>
      </header>

      <main className="flex-1 px-6 pb-8 overflow-auto">
        <div className="max-w-sm mx-auto">
          {/* Garden header */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: garden.color + '26' }}
              aria-hidden="true"
            >
              {garden.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-rounded font-semibold text-deep">{garden.name}</h1>
              <p className="text-xs text-sub mt-1">{garden.description}</p>
            </div>
          </div>

          {/* Overall progress */}
          <div className="flex items-center gap-2 mb-1">
            <div
              className="flex-1 h-1.5 bg-soft rounded-full overflow-hidden retint"
              role="progressbar"
              aria-valuenow={overallDone}
              aria-valuemin={0}
              aria-valuemax={overallTotal}
              aria-label={`${garden.name} overall progress`}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${overallPercent}%`, backgroundColor: garden.color }}
              />
            </div>
            <span className="text-xs text-sub">
              {overallDone}/{overallTotal}
            </span>
          </div>
          {notesLink && <div className="mt-3">{notesLink}</div>}

          {/* Branch waypoints (empty branches hidden) */}
          <div className="space-y-3 mt-6">
            {coverage.byBranch
              .filter((b) => b.total > 0)
              .map((b) => {
                const complete = b.answered === b.total;
                const pct = b.total > 0 ? (b.answered / b.total) * 100 : 0;
                return (
                  // A finished branch stops being tappable: re-answering would
                  // append duplicate answer rows (coverage dedupes, the answer
                  // log and portrait would not). Per-item revisit is a later,
                  // deliberate build (change-answer flow, not silent re-asks).
                  <button
                    key={b.key}
                    onClick={complete ? undefined : () => enterBranch(b.key)}
                    disabled={complete}
                    className={`w-full bg-card border-2 border-ink rounded-xl shadow-chunk-sm retint p-4 transition-all text-left ${
                      complete
                        ? 'cursor-default'
                        : 'hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-chunk-xs'
                    }`}
                    aria-label={
                      complete
                        ? `${b.name} branch complete, ${b.answered} of ${b.total} answered`
                        : `Open the ${b.name} branch, ${b.answered} of ${b.total} answered`
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-ink font-rounded font-semibold text-sm">{b.name}</span>
                      <span className="text-xs text-sub">
                        {b.answered}/{b.total}
                        {complete && ' ✓'}
                      </span>
                    </div>
                    <div
                      className="h-1 bg-soft rounded-full overflow-hidden retint"
                      role="progressbar"
                      aria-valuenow={b.answered}
                      aria-valuemin={0}
                      aria-valuemax={b.total}
                      aria-label={`${b.name} progress`}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: garden.color }}
                      />
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Root row */}
          {rooted && (
            <div className="mt-6">
              {!coverage.rootUnlocked && !coverage.rootAnswer ? (
                // Locked — earned only once every branch is fully answered.
                <div
                  className="w-full border-2 border-dashed rounded-xl p-5 opacity-60"
                  style={{ borderColor: garden.color }}
                  aria-label="The root question is locked"
                >
                  <p className="text-sm font-rounded font-semibold text-sub">the root question</p>
                  <p className="text-xs text-sub mt-1">answer everything above first</p>
                </div>
              ) : (
                <button
                  onClick={openRoot}
                  className="w-full border-2 rounded-xl shadow-chunk-sm retint p-5 text-left transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-chunk-xs"
                  style={{ borderColor: garden.color, backgroundColor: garden.color + '14' }}
                  aria-label={
                    coverage.rootAnswer
                      ? 'Revisit the root question and verdict'
                      : 'Answer the root question'
                  }
                >
                  <p className="text-xs font-rounded font-semibold text-sub mb-1">
                    the root question{coverage.rootAnswer && ' ✓'}
                  </p>
                  <p className="text-base font-rounded font-semibold text-ink leading-relaxed">
                    {garden.root.text}
                  </p>
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
