// Greenhouse preview harness — dev-server only (`npm run dev` → /preview.html).
//
// Mounts the real QuestionCard against the real question bank so the theme can be
// reviewed without signing in: every palette family, light and dark, with fine
// print, resurfaced notes and echoes exercised. Vite's default build only picks up
// index.html, so none of this reaches production (verified: absent from dist/).
//
// It exists because the app's own question flow is behind an auth guard, which
// makes the signature feature — the per-vibe re-tint — otherwise unreviewable
// without credentials.
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { CilantroProvider } from './context/CilantroContext';
import QuestionCard from './components/QuestionCard';
import ShapesBackground from './components/ShapesBackground';
import { useVibeTheme } from './theme/useVibeTheme';
import { syncThemeColor } from './theme/syncThemeColor';
import { questions } from './data/questions';
import { getFinePrint } from './data/finePrint';
import { getQuestionMeta } from './data/questionMeta';
import { PALETTES, familyForVibe } from './theme/palettes';
import './index.css';

// One real question per palette family — preferring one that actually carries
// fine print, so the dossier panel is exercised too.
const SAMPLES = Object.keys(PALETTES).map((family) => {
  const inFamily = questions.filter((q) => familyForVibe(q.vibe) === family);
  const rich = inFamily.find(
    (q) => getFinePrint(q.text) && getQuestionMeta(q.text).tags.length > 0
  );
  const q = rich || inFamily.find((q) => getFinePrint(q.text)) || inFamily[0];
  return q ? { ...q, family } : null;
}).filter(Boolean);

function Harness() {
  const [i, setI] = useState(0);
  const [dark, setDark] = useState(false);
  const q = SAMPLES[i];
  useVibeTheme(q?.vibe);

  // Mirrors CilantroContext's dark-mode effect (class + theme-color sync). The
  // harness toggles dark locally rather than through the context, so it has to
  // do the same work — otherwise it would misrepresent the real app.
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    syncThemeColor();
  }, [dark]);

  if (!q) return <p>no samples</p>;

  return (
    <div className="min-h-screen relative flex flex-col">
      <ShapesBackground seed={q.text} />
      <div className="relative p-4 flex gap-2 flex-wrap items-center">
        {SAMPLES.map((s, n) => (
          <button
            key={s.family}
            onClick={() => setI(n)}
            className={`px-3 py-1 rounded-full text-xs font-rounded font-bold border-2 border-ink retint ${
              n === i ? 'bg-deep text-canvas' : 'bg-card text-ink'
            }`}
          >
            {s.family}
          </button>
        ))}
        <button
          onClick={() => setDark((d) => !d)}
          className="px-3 py-1 rounded-full text-xs font-rounded font-bold border-2 border-ink bg-card text-ink retint ml-auto"
        >
          {dark ? 'light' : 'dark'}
        </button>
      </div>
      <main className="flex-1 flex items-center justify-center px-6 pb-10 relative">
        <div className="max-w-sm w-full">
          <QuestionCard
            question={q.text}
            vibe={q.vibe}
            resurfaced={i % 3 === 1}
            echo={i % 3 === 2 ? { previousAnswer: 'yes', previousTime: Date.now() - 86400000 * 9 } : null}
            isTransitioning={false}
            onYes={() => setI((n) => (n + 1) % SAMPLES.length)}
            onNo={() => setI((n) => (n + 1) % SAMPLES.length)}
            onSkip={() => setI((n) => (n + 1) % SAMPLES.length)}
            skipLabel="skip for now"
          />
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <MemoryRouter>
    <CilantroProvider>
      <Harness />
    </CilantroProvider>
  </MemoryRouter>
);
