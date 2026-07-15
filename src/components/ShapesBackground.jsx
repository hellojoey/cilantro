import React, { useEffect, useRef } from 'react';

// The geometric shapes drifting behind every screen.
//
// Each shape wanders on its own unrepeating path — a slow random drift to a
// nearby point, an easing pause, then a new direction. Same gentle amplitude as
// a bob, but organic instead of metronomic, so no two shapes ever sync up.
// Spec: design/concepts.html, concept c2 ("Motion").

const AMP = 30; // px of drift in each direction

// Shapes are painted from palette tokens, so they re-tint with the question.
const SHAPES = [
  { key: 'ring', className: 'absolute -top-[70px] -right-[60px] w-[300px] h-[300px] rounded-full border-[34px] border-mid animate-[spin_70s_linear_infinite]' },
  { key: 'pill', className: 'absolute bottom-[12%] -left-[60px] w-[220px] h-[90px] rounded-full bg-accent opacity-[0.55]' },
  { key: 'dot', className: 'absolute top-[20%] left-[12%] w-[46px] h-[46px] rounded-full bg-accent' },
];

export default function ShapesBackground() {
  const rootRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = rootRef.current;
    if (!root) return;

    const animations = [];
    const timers = [];

    root.querySelectorAll('[data-shape]').forEach((el) => {
      let x = 0;
      let y = 0;
      const wander = () => {
        const nx = (Math.random() * 2 - 1) * AMP;
        const ny = (Math.random() * 2 - 1) * AMP;
        const anim = el.animate(
          [{ translate: `${x}px ${y}px` }, { translate: `${nx}px ${ny}px` }],
          { duration: 8000 + Math.random() * 7000, easing: 'ease-in-out', fill: 'forwards' }
        );
        animations.push(anim);
        x = nx;
        y = ny;
        anim.onfinish = wander;
      };
      // Stagger the starts so the shapes never move as a group.
      timers.push(setTimeout(wander, Math.random() * 3000));
    });

    return () => {
      timers.forEach(clearTimeout);
      // Drop onfinish first — otherwise cancel() re-entrantly schedules another wander.
      animations.forEach((a) => {
        a.onfinish = null;
        a.cancel();
      });
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {SHAPES.map(({ key, className }) => (
        <div key={key} data-shape className={`${className} retint opacity-75`} />
      ))}
      {/* Triangle: borders, so it can't be a plain div with a bg. */}
      <div
        data-shape
        className="retint absolute top-[56%] right-[8%] w-0 h-0 opacity-75 animate-[spin_80s_linear_infinite_reverse]"
        style={{
          borderLeft: '70px solid transparent',
          borderRight: '70px solid transparent',
          borderBottom: '120px solid rgb(var(--c-soft))',
        }}
      />
      <svg
        data-shape
        className="retint absolute top-[8%] left-[42%] text-accent opacity-75"
        width="160"
        height="60"
        viewBox="0 0 160 60"
      >
        <path
          d="M4 30 Q 24 4, 44 30 T 84 30 T 124 30 T 164 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
