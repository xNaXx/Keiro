import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

/**
 * A living set of rings around the mood word. While the voice speaks the
 * rings swell and shiver organically (Siri-like); in the silences they
 * settle back into a slow breath.
 *
 * Demo mode drives it from speech start/end events; once real ElevenLabs
 * audio lands, plug an AnalyserNode level into `active` for true
 * amplitude-reactive motion.
 */
export function VoiceOrb({
  size = 180,
  color = 'rgba(255,255,255,0.8)',
  active = false,
  children,
}: {
  size?: number;
  color?: string;
  active?: boolean;
  children?: React.ReactNode;
}) {
  const rings = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    let alive = true;

    // each ring wanders on its own clock; amplitude depends on voice activity
    const wander = (v: Animated.Value, i: number) => {
      if (!alive) return;
      const talking = activeRef.current;
      const target = talking ? 0.35 + Math.random() * 0.65 : 0.08 + Math.random() * 0.12;
      const duration = talking ? 160 + Math.random() * 240 : 1800 + Math.random() * 1400;
      Animated.timing(v, {
        toValue: target,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start(() => wander(v, i));
    };
    rings.forEach((v, i) => wander(v, i));

    return () => {
      alive = false;
      rings.forEach((v) => v.stopAnimation());
    };
  }, [rings]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {rings.map((v, i) => {
        const base = 0.78 + i * 0.11;
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: 1,
              borderColor: color,
              opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.75 - i * 0.18, 0.25] }),
              transform: [
                { scale: v.interpolate({ inputRange: [0, 1], outputRange: [base, base + 0.16] }) },
              ],
            }}
          />
        );
      })}
      {children}
    </View>
  );
}
