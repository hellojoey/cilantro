import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCilantro } from '../context/CilantroContext';
import { vibeAccent } from '../theme/palettes';

// One vibe from each palette family — the dots quietly preview the range of
// colors the app re-tints through.
const PREVIEW_VIBES = ['peace', 'joy', 'courage', 'honesty', 'curiosity', 'love'];

export default function Welcome() {
  const navigate = useNavigate();
  const { darkMode } = useCilantro();

  return (
    <div className="min-h-screen bg-canvas retint flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        {/* Logo/Brand */}
        <div className="mb-12">
          <h1 className="text-5xl font-rounded font-bold tracking-tight text-deep retint mb-3">
            cilantro
          </h1>
          <p className="text-sub retint">
            yes or no. find yourself.
          </p>
        </div>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mb-12" aria-hidden="true">
          {PREVIEW_VIBES.map((vibe) => (
            <div
              key={vibe}
              className="w-2 h-2 rounded-full opacity-60"
              style={{ backgroundColor: vibeAccent(vibe, darkMode ? 'dark' : 'light') }}
            />
          ))}
        </div>

        {/* Auth buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/signup')}
            className="w-full py-4 px-11 bg-deep text-canvas rounded-[18px] font-rounded font-semibold text-lg shadow-ledge retint transition-all hover:translate-y-[2px] hover:shadow-ledge-sm active:scale-[0.98]"
          >
            get started
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-card border-2 border-ink text-ink rounded-[18px] font-rounded font-semibold text-lg retint transition-all hover:translate-x-[1px] hover:translate-y-[1px] active:scale-[0.98]"
          >
            sign in
          </button>
        </div>

        <p className="mt-8 text-xs text-sub font-rounded font-semibold opacity-55 retint" aria-hidden="true">
          reflect. grow. repeat.
        </p>
      </div>
    </div>
  );
}
