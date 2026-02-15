import React from 'react';

export default function RadarChart({ dimensions, scores, size = 280 }) {
  const center = size / 2;
  const radius = size * 0.35;
  const labelOffset = radius + 28;
  const levels = 3; // concentric rings

  // Calculate point position for a given dimension index and distance from center
  const getPoint = (index, distance) => {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  // Build polygon points string for a given radius
  const polygonPoints = (r) =>
    dimensions.map((_, i) => {
      const p = getPoint(i, r);
      return `${p.x},${p.y}`;
    }).join(' ');

  // Build score polygon
  const scorePoints = scores.map((score, i) => {
    if (score === null) return getPoint(i, 0); // No data = center
    const dist = (score / 100) * radius;
    return getPoint(i, dist);
  });
  const scorePolygon = scorePoints.map(p => `${p.x},${p.y}`).join(' ');

  const hasAnyData = scores.some(s => s !== null);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
      role="img"
      aria-label="Character radar chart"
    >
      {/* Concentric level polygons */}
      {Array.from({ length: levels }, (_, level) => {
        const r = radius * ((level + 1) / levels);
        return (
          <polygon
            key={level}
            points={polygonPoints(r)}
            fill="none"
            className="stroke-stone-200 dark:stroke-stone-600"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Axis lines from center to each vertex */}
      {dimensions.map((_, i) => {
        const p = getPoint(i, radius);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            className="stroke-stone-200 dark:stroke-stone-600"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Score polygon fill */}
      {hasAnyData && (
        <polygon
          points={scorePolygon}
          className="fill-amber-400/20 stroke-amber-500 dark:fill-amber-400/15 dark:stroke-amber-400"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}

      {/* Score dots */}
      {scores.map((score, i) => {
        if (score === null) return null;
        const p = getPoint(i, (score / 100) * radius);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            className="fill-amber-500 dark:fill-amber-400"
          />
        );
      })}

      {/* Dimension labels */}
      {dimensions.map((label, i) => {
        const p = getPoint(i, labelOffset);
        const score = scores[i];
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-stone-500 dark:fill-stone-400 text-[10px] font-light"
          >
            <tspan x={p.x} dy="-0.4em">{label}</tspan>
            <tspan
              x={p.x}
              dy="1.2em"
              className={score !== null ? 'fill-stone-400 dark:fill-stone-500' : 'fill-stone-300 dark:fill-stone-600'}
            >
              {score !== null ? `${score}%` : '—'}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
