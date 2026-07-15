import React from 'react';

// `compareScores` (optional) renders a second, dashed polygon underneath —
// used by Profile for the "then vs now" view of your character.
export default function RadarChart({ dimensions, scores, compareScores, size = 280 }) {
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

  // Comparison polygon (then), drawn beneath the main one (now)
  const comparePoints = compareScores
    ? compareScores.map((score, i) => {
        if (score === null) return getPoint(i, 0);
        return getPoint(i, (score / 100) * radius);
      })
    : null;
  const comparePolygon = comparePoints ? comparePoints.map(p => `${p.x},${p.y}`).join(' ') : null;
  const hasCompareData = compareScores ? compareScores.some(s => s !== null) : false;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto retint"
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
            className="stroke-mid"
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
            className="stroke-mid"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Comparison polygon (who you were) */}
      {hasCompareData && (
        <polygon
          points={comparePolygon}
          fill="none"
          className="stroke-sub"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          strokeLinejoin="round"
        />
      )}

      {/* Score polygon fill */}
      {hasAnyData && (
        <polygon
          points={scorePolygon}
          className="fill-accent/20 stroke-accent"
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
            className="fill-accent"
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
            className="fill-sub text-[10px] font-rounded font-medium"
          >
            <tspan x={p.x} dy="-0.4em">{label}</tspan>
            <tspan
              x={p.x}
              dy="1.2em"
              className={score !== null ? 'fill-sub' : 'fill-sub/50'}
            >
              {score !== null ? `${score}%` : '—'}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
