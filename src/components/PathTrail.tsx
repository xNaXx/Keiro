import React from 'react';
import Svg, { Circle } from 'react-native-svg';

/**
 * A winding dotted footpath — the sendero. Steps already walked glow;
 * the way ahead fades into the distance. The current step breathes.
 */
export function PathTrail({
  width = 300,
  height = 90,
  progress = 0.4,
  color = 'rgba(255,255,255,0.9)',
  faint = 'rgba(255,255,255,0.3)',
}: {
  width?: number;
  height?: number;
  /** 0..1, how much of the path is behind you */
  progress?: number;
  color?: string;
  faint?: string;
}) {
  // sample points along a gentle S-curve
  const pts: { x: number; y: number }[] = [];
  const N = 11;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const x = 14 + t * (width - 36);
    const y = height / 2 + Math.sin(t * Math.PI * 1.6 + 0.4) * (height / 2 - 14);
    pts.push({ x, y });
  }
  const lit = Math.round(progress * (N - 1));

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {pts.map((p, i) => (
        <Circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === lit ? 4 : 2.2}
          fill={i <= lit ? color : 'none'}
          stroke={i <= lit ? 'none' : faint}
          strokeWidth={1}
        />
      ))}
      <Circle cx={pts[lit].x} cy={pts[lit].y} r={8} stroke={color} strokeWidth={0.8} fill="none" opacity={0.7} />
    </Svg>
  );
}
