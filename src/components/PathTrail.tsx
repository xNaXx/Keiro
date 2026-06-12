import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
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

  // the current step pulses softly, like a heartbeat at walking pace
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.out(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.5] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.8, 0] });
  const R = 12;

  return (
    <View style={{ width, height }}>
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
      </Svg>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: pts[lit].x - R,
          top: pts[lit].y - R,
          width: R * 2,
          height: R * 2,
          borderRadius: R,
          borderWidth: 1,
          borderColor: color,
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />
    </View>
  );
}
