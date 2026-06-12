import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Sparkle } from './Sparkle';
import { Float } from './Motion';
import { useApp } from '../store';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** Star field for dark mode: tiny dots + a few twinkling sparkles. */
function Stars() {
  const { width, height } = useWindowDimensions();
  const stars = useMemo(() => {
    const rng = seededRandom(7);
    return Array.from({ length: 90 }, (_, i) => ({
      x: rng() * width,
      y: rng() * height,
      r: 0.6 + rng() * 1.4,
      o: 0.25 + rng() * 0.6,
      sparkle: i % 22 === 0,
    }));
  }, [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s, i) =>
        s.sparkle ? (
          <Sparkle
            key={i}
            size={10 + s.r * 4}
            color="rgba(255,255,255,0.85)"
            twinkle
            style={{ position: 'absolute', left: s.x, top: s.y }}
          />
        ) : (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              width: s.r * 2,
              height: s.r * 2,
              borderRadius: s.r,
              backgroundColor: `rgba(255,255,255,${s.o})`,
            }}
          />
        )
      )}
    </View>
  );
}

/** Soft drifting clouds of light for light mode. */
function Glow({ colors }: { colors: string[] }) {
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const { width, height } = size;
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {width > 0 && (
      <Float distance={14} duration={16000} scaleAmount={0.03} style={StyleSheet.absoluteFill as any}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="glowA" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors[0]} stopOpacity="0.65" />
            <Stop offset="60%" stopColor={colors[0]} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="glowB" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors[1]} stopOpacity="0.6" />
            <Stop offset="60%" stopColor={colors[1]} stopOpacity="0.28" />
            <Stop offset="100%" stopColor={colors[1]} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={width * 0.12} cy={height * 0.32} r={width * 0.65} fill="url(#glowA)" />
        <Circle cx={width * 0.92} cy={height * 0.62} r={width * 0.6} fill="url(#glowB)" />
      </Svg>
      </Float>
      )}
    </View>
  );
}

export function GradientBackground({
  colors,
  glow,
  children,
}: {
  /** override the palette's background gradient (e.g. mood palettes) */
  colors?: [string, string, string];
  /** extra glow blobs, e.g. ['#ffd9c0','#cfe0ff'] */
  glow?: [string, string];
  children?: React.ReactNode;
}) {
  const { palette } = useApp();
  const stops = colors ?? palette.bg;
  return (
    <LinearGradient colors={stops} style={styles.fill} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}>
      {glow && <Glow colors={glow} />}
      {palette.stars && <Stars />}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1, overflow: 'hidden' } });
