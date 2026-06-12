import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { FONTS } from '../theme';

/**
 * The Keiro wordmark. The "I" between KE and RO is drawn as a winding
 * dotted path — the sendero — crowned by a four-pointed star: the next
 * step always lit.
 */
function PathGlyph({ height, color }: { height: number; color: string }) {
  const width = height * 0.42;
  // dots descend along a gentle S-curve (viewBox 20 x 48)
  const dots = [
    { x: 10, y: 45, r: 1.1, o: 0.35 },
    { x: 12.5, y: 39.5, r: 1.3, o: 0.45 },
    { x: 13.5, y: 33.5, r: 1.5, o: 0.55 },
    { x: 11.5, y: 27.5, r: 1.7, o: 0.7 },
    { x: 8.5, y: 22, r: 1.9, o: 0.82 },
    { x: 8, y: 16, r: 2.1, o: 0.92 },
    { x: 10, y: 10.5, r: 2.3, o: 1 },
  ];
  return (
    <Svg width={width} height={height} viewBox="0 0 20 48">
      {dots.map((d, i) => (
        <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} opacity={d.o} />
      ))}
      {/* the star at the top of the path */}
      <Path
        d="M10 0 C10.5 2.8 11.9 4.2 14.7 4.7 C11.9 5.2 10.5 6.6 10 9.4 C9.5 6.6 8.1 5.2 5.3 4.7 C8.1 4.2 9.5 2.8 10 0 Z"
        fill={color}
      />
    </Svg>
  );
}

export function KeiroLogo({
  size = 44,
  color,
}: {
  /** font size of the letters; the glyph scales with it */
  size?: number;
  color: string;
}) {
  const letter = {
    fontFamily: FONTS.serif,
    fontSize: size,
    letterSpacing: size * 0.06,
    color,
    lineHeight: size * 1.15,
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={letter}>KE</Text>
      <View style={{ marginHorizontal: size * 0.08, marginTop: size * 0.06 }}>
        <PathGlyph height={size * 0.92} color={color} />
      </View>
      <Text style={letter}>RO</Text>
    </View>
  );
}

/** Small brand mark for screen headers. */
export function Brand({ color, size = 17 }: { color: string; size?: number }) {
  return <KeiroLogo size={size} color={color} />;
}
