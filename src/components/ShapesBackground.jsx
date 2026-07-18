import React, { useEffect, useRef } from 'react';

// The geometric shapes drifting behind every screen.
//
// Each shape wanders on its own unrepeating path — a slow random drift to a
// nearby point, an easing pause, then a new direction. Same gentle amplitude as
// a bob, but organic instead of metronomic, so no two shapes ever sync up.
// Spec: design/concepts.html, concept c2 ("Motion").
//
// The *composition* — which shapes appear and where — is chosen from `seed`
// (the current question's text). A tiny hash maps the seed onto one of the
// compositions below, so every question gets its own arrangement instead of
// only a re-tint. No seed → composition 0, the original layout, so non-question
// screens (Welcome, Login, Profile…) look exactly as before.

const AMP = 30; // px of drift in each direction

// FNV-1a: a couple of lines, no deps, well-spread for short strings. Only used
// to pick a composition, so collisions just mean two questions share a layout.
function hashSeed(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Spin classes are kept as literal strings so Tailwind's static scan emits them.
const SPIN_A = 'animate-[spin_70s_linear_infinite]';
const SPIN_B = 'animate-[spin_80s_linear_infinite_reverse]';
const SPIN_C = 'animate-[spin_90s_linear_infinite]';
const SPIN_D = 'animate-[spin_60s_linear_infinite_reverse]';

// Reusable SVG line-work. Colour comes from the `text-*` token on the <svg>.
const squigglePath = (
  <path
    d="M4 30 Q 24 4, 44 30 T 84 30 T 124 30 T 164 30"
    fill="none"
    stroke="currentColor"
    strokeWidth="9"
    strokeLinecap="round"
  />
);
const zigzagPath = (
  <polyline
    points="4,40 24,8 44,40 64,8 84,40 104,8 124,40"
    fill="none"
    stroke="currentColor"
    strokeWidth="9"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
);

// A plus/cross built from two rounded bars — passed as children of a wrapper
// that carries data-shape (so the whole cross wanders as one).
const crossBars = (
  <>
    <div
      className="absolute bg-accent retint"
      style={{ top: '50%', left: 0, width: '100%', height: 22, marginTop: -11, borderRadius: 9999 }}
    />
    <div
      className="absolute bg-accent retint"
      style={{ left: '50%', top: 0, width: 22, height: '100%', marginLeft: -11, borderRadius: 9999 }}
    />
  </>
);

// Every shape is one descriptor:
//   { className, style?, el?, attrs?, node?, children? }
// Geometry (size / position / border-width / corner-radius / rotation) rides on
// inline `style` so compositions can vary freely — Tailwind can't emit classes
// built at runtime. Colour always rides on a palette *class* (bg-accent, border-mid,
// text-accent…) or an rgb(var(--c-*)) inline value, plus the appended `retint`, so
// re-tinting keeps working. Never a raw hex.
//
// Discipline for all compositions: shapes hug the top band, the bottom band, or
// the left/right edges — the vertical middle stays clear for the question card
// (mobile-first ~375px wide).
const COMPOSITIONS = [
  // 0 — ORIGINAL layout. Kept byte-for-byte (literal classes, no inline geometry)
  // so seedless screens are unchanged: corner ring, low-left pill, upper-left dot,
  // right-edge triangle, top squiggle.
  [
    { className: 'absolute -top-[70px] -right-[60px] w-[300px] h-[300px] rounded-full border-[34px] border-mid ' + SPIN_A },
    { className: 'absolute bottom-[12%] -left-[60px] w-[220px] h-[90px] rounded-full bg-accent opacity-[0.55]' },
    { className: 'absolute top-[20%] left-[12%] w-[46px] h-[46px] rounded-full bg-accent' },
    {
      className: 'absolute top-[56%] right-[8%] w-0 h-0 ' + SPIN_B,
      style: {
        borderLeft: '70px solid transparent',
        borderRight: '70px solid transparent',
        borderBottom: '120px solid rgb(var(--c-soft))',
      },
    },
    {
      el: 'svg',
      className: 'absolute top-[8%] left-[42%] text-accent',
      attrs: { width: 168, height: 66, viewBox: '0 -3 168 66' },
      node: squigglePath,
    },
  ],

  // 1 — "Top arc": small spinning ring in the top-left corner, a dome (arch) at
  // top-right, dot low-left, tilted rounded square bleeding off bottom-right, a
  // small squiggle across the bottom.
  [
    { className: 'absolute rounded-full border-mid ' + SPIN_C, style: { top: -40, left: -40, width: 140, height: 140, borderWidth: 18 } },
    { className: 'absolute bg-soft', style: { top: '4%', right: '6%', width: 160, height: 80, borderRadius: '9999px 9999px 0 0' } },
    { className: 'absolute rounded-full bg-accent', style: { bottom: '16%', left: '8%', width: 40, height: 40 } },
    { className: 'absolute bg-mid', style: { bottom: '10%', right: -30, width: 110, height: 110, borderRadius: 24, transform: 'rotate(12deg)' } },
    { el: 'svg', className: 'absolute text-accent', style: { bottom: '6%', left: '28%' }, attrs: { width: 126, height: 50, viewBox: '0 -3 168 66' }, node: squigglePath },
  ],

  // 2 — "Diagonal drift": big spinning ring bleeding top-right, spinning triangle
  // low-left, translucent pill off the top-left edge, soft dot low-right, zigzag
  // riding high above the card.
  [
    { className: 'absolute rounded-full border-mid ' + SPIN_A, style: { top: -80, right: -70, width: 300, height: 300, borderWidth: 30 } },
    {
      className: 'absolute w-0 h-0 ' + SPIN_D,
      style: { bottom: '8%', left: '6%', borderLeft: '60px solid transparent', borderRight: '60px solid transparent', borderBottom: '104px solid rgb(var(--c-mid))' },
    },
    { className: 'absolute rounded-full bg-accent', style: { top: '6%', left: -70, width: 200, height: 80, opacity: 0.5 } },
    { className: 'absolute rounded-full bg-soft', style: { bottom: '14%', right: '12%', width: 52, height: 52 } },
    { el: 'svg', className: 'absolute text-mid', style: { top: '3%', left: '34%' }, attrs: { width: 128, height: 48, viewBox: '0 0 128 48' }, node: zigzagPath },
  ],

  // 3 — "Corners quartet": two quarter-round wedges cradling opposite corners
  // (top-left + bottom-right, curves facing in), a small spinning ring top-right,
  // dot low-left, squiggle riding high.
  [
    { className: 'absolute bg-soft', style: { top: -10, left: -10, width: 150, height: 150, borderRadius: '0 0 100% 0' } },
    { className: 'absolute bg-mid', style: { bottom: -10, right: -10, width: 150, height: 150, borderRadius: '100% 0 0 0' } },
    { className: 'absolute rounded-full border-mid ' + SPIN_B, style: { top: '4%', right: '8%', width: 96, height: 96, borderWidth: 14 } },
    { className: 'absolute rounded-full bg-accent', style: { bottom: '12%', left: '10%', width: 44, height: 44 } },
    { el: 'svg', className: 'absolute text-accent', style: { top: '2%', left: '38%' }, attrs: { width: 120, height: 47, viewBox: '0 -3 168 66' }, node: squigglePath },
  ],

  // 4 — "Plus & pills": rounded plus/cross top-left, translucent pill off the
  // bottom-right edge, spinning ring bleeding top-right, dot low-left, tilted
  // rounded square riding high.
  [
    { className: 'absolute', style: { top: '5%', left: '8%', width: 84, height: 84 }, children: crossBars },
    { className: 'absolute rounded-full bg-soft', style: { bottom: '12%', right: -60, width: 210, height: 84, opacity: 0.6 } },
    { className: 'absolute rounded-full border-mid ' + SPIN_A, style: { top: -70, right: -60, width: 260, height: 260, borderWidth: 28 } },
    { className: 'absolute rounded-full bg-accent', style: { bottom: '8%', left: '14%', width: 48, height: 48 } },
    { className: 'absolute bg-mid', style: { top: '3%', right: '32%', width: 80, height: 80, borderRadius: 20, transform: 'rotate(12deg)' } },
  ],

  // 5 — "Arch band": a dome (arch) flush to the bottom-left, squiggle top-right,
  // small spinning ring off the bottom-right edge, spinning triangle top-left,
  // dot riding high.
  [
    { className: 'absolute bg-soft', style: { bottom: 0, left: -20, width: 200, height: 100, borderRadius: '9999px 9999px 0 0' } },
    { el: 'svg', className: 'absolute text-accent', style: { top: '7%', right: '6%' }, attrs: { width: 150, height: 59, viewBox: '0 -3 168 66' }, node: squigglePath },
    { className: 'absolute rounded-full border-mid ' + SPIN_C, style: { bottom: '16%', right: -30, width: 130, height: 130, borderWidth: 20 } },
    {
      className: 'absolute w-0 h-0 ' + SPIN_B,
      style: { top: '5%', left: '8%', borderLeft: '56px solid transparent', borderRight: '56px solid transparent', borderBottom: '96px solid rgb(var(--c-mid))' },
    },
    { className: 'absolute rounded-full bg-accent', style: { top: '4%', left: '44%', width: 40, height: 40 } },
  ],

  // 6 — "Big geometry": oversized spinning ring in the top-left corner, translucent
  // quarter-round wedge cradling the bottom-right, pill off the top-right edge,
  // zigzag low-left, soft dot on the right edge.
  [
    { className: 'absolute rounded-full border-mid ' + SPIN_D, style: { top: -90, left: -80, width: 320, height: 320, borderWidth: 36 } },
    { className: 'absolute bg-accent', style: { bottom: -20, right: -20, width: 170, height: 170, borderRadius: '100% 0 0 0', opacity: 0.6 } },
    { className: 'absolute rounded-full bg-mid', style: { top: '6%', right: -70, width: 200, height: 78 } },
    { el: 'svg', className: 'absolute text-accent', style: { bottom: '8%', left: '8%' }, attrs: { width: 128, height: 48, viewBox: '0 0 128 48' }, node: zigzagPath },
    { className: 'absolute rounded-full bg-soft', style: { bottom: '18%', right: '10%', width: 46, height: 46 } },
  ],
];

function ShapeEl({ shape }) {
  const className = `${shape.className} retint opacity-75`;
  if (shape.el === 'svg') {
    return (
      <svg data-shape className={className} style={shape.style} {...shape.attrs}>
        {shape.node}
      </svg>
    );
  }
  return (
    <div data-shape className={className} style={shape.style}>
      {shape.children}
    </div>
  );
}

export default function ShapesBackground({ seed }) {
  const rootRef = useRef(null);

  const index = seed ? hashSeed(seed) % COMPOSITIONS.length : 0;
  const shapes = COMPOSITIONS[index];

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
    // Re-run when the composition swaps (new question → new seed). The cleanup
    // above tears down the previous arrangement's animations first.
  }, [seed]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {shapes.map((shape, i) => (
        <ShapeEl key={i} shape={shape} />
      ))}
    </div>
  );
}
