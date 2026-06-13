import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * The Keiro wordmark, exported from Illustrator. A single-colour lockup of
 * "Keiro" whose "i" is dotted with a four-pointed star — the brand's path/
 * star motif living inside the word itself.
 *
 * `size` is the rendered height in px; the width keeps the artwork's native
 * aspect ratio. `color` fills every glyph, so the same mark works in positive
 * (dark) or negative (white) over any background.
 */
const VB_W = 456.99;
const VB_H = 151.59;
const ASPECT = VB_W / VB_H;

// the five glyphs of the wordmark (K, e, i + star, r, o), straight from the SVG
const GLYPHS = [
  'M132.18,147.18v2.34h-59.16v-2.34c8.22,0,15.61-3.99,10.22-18.31l-5.87-15.73c-7.63-20.42-31.93-26.06-31.93-3.4v19.13c0,15.38,5.52,18.31,13.73,18.31v2.34H0v-2.34c8.21,0,13.73-2.93,13.73-18.31V41.05c0-15.37-5.52-18.31-13.73-18.31v-2.34h59.16v2.35c-8.21,0-13.73,2.93-13.73,18.31v57.47c2.9-7.53,8.25-15.21,14.79-21.91l34.75-35.57c10.68-10.92,8.56-18.31.35-18.31v-2.34h30.99v2.34c-8.22,0-17.14,7.39-27.82,18.31l-36.28,37.1c24.18-8.68,40.14,9.86,46.83,31.58l5.87,19.02c4.58,14.78,9.03,18.43,17.27,18.43Z',
  'M149.51,91.05c3.19,8.59,8.41,16.77,15.08,23.01,20.3,19.02,38.03,26.65,48.48,20.19l1.76,1.64c-20.42,20.42-52.59,21.12-73.02.7-10.22-10.21-15.26-23.71-15.26-37.21,0-28.99,18.9-52.23,50.01-52.23,19.95,0,36.51,10.68,36.51,28.76,0,29.27-46.92,35.74-63.55,15.14ZM146.03,74.03c0,10.1,11.39,24.3,25.24,24.3,10.22,0,17.26-7.98,17.26-24.3s-9.04-23.25-20.89-23.25c-8.8,0-22.07,5.63-21.6,23.25Z',
  'M278.31,147.18v2.34h-59.16v-2.34c8.21,0,13.73-2.93,13.73-18.31v-57.4c0-15.38-5.52-18.31-13.73-18.31v-2.34h24.77c15.38,0,18.31-5.52,18.31-13.73h2.35v91.79c0,15.38,5.52,18.32,13.73,18.3ZM230.42,20.65v-2.34c8.22,0,17.26-2.93,17.26-18.31h2.34c0,15.37,7.87,18.31,16.08,18.31v2.35c-8.22,0-16.08,2.93-16.08,18.31h-2.34c0-15.38-9.03-18.32-17.26-18.32Z',
  'M441.94,136.53c-20.08,20.07-53.06,20.07-73.13,0-20.07-20.08-20.07-53.06,0-73.13,1.34-1.33,2.87-2.34,4.3-3.5-7.56-8.98-46.54-16.47-46.54,34.23v34.51c0,15.38,5.52,18.31,13.73,18.31v2.34h-59.16v-2.34c8.21,0,13.73-2.93,13.73-18.31v-57.28c0-15.38-5.52-18.31-13.73-18.31v-2.34h24.77c15.38,0,18.31-5.52,18.31-13.73h2.34v33.06c3.69-13.75,12.72-21.67,33.69-21.67h41.6l-.73.4c14.65-1.2,29.7,3.53,40.81,14.65,20.07,20.08,20.09,53.05,0,73.12ZM419.5,85.83c-19.25-19.25-41.08-28.64-48.95-20.77-7.86,7.86,1.76,30.17,21.13,49.54,19.36,19.37,40.73,28.06,48.48,20.31,7.98-7.98-1.29-29.7-20.66-49.08Z',
];

export function KeiroLogo({
  size = 44,
  color,
}: {
  /** rendered height in px; width follows the artwork's aspect ratio */
  size?: number;
  color: string;
}) {
  return (
    <Svg width={size * ASPECT} height={size} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      {GLYPHS.map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
    </Svg>
  );
}

/** Small brand mark for screen headers. */
export function Brand({ color, size = 19 }: { color: string; size?: number }) {
  return <KeiroLogo size={size} color={color} />;
}
