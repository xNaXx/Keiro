import React from 'react';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

/** Soft glowing orb with a blurred edge — used for moods and voices. */
export function MoodOrb({
  size = 56,
  color,
  core,
  ring,
}: {
  size?: number;
  color: string;
  /** inner glow color (defaults to a lighter veil of `color`) */
  core?: string;
  /** optional thin outline ring color */
  ring?: string;
}) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`orb${id}`} cx="50%" cy="42%" r="55%">
          <Stop offset="0%" stopColor={core ?? '#ffffff'} stopOpacity="0.9" />
          <Stop offset="45%" stopColor={color} stopOpacity="0.85" />
          <Stop offset="80%" stopColor={color} stopOpacity="0.55" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      {ring && <Circle cx="50" cy="50" r="46" stroke={ring} strokeWidth="1" fill="none" opacity={0.6} />}
      <Circle cx="50" cy="50" r="44" fill={`url(#orb${id})`} />
    </Svg>
  );
}
