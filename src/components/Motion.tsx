import React, { useEffect, useRef } from 'react';
import { Animated, Easing, PanResponder, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Barely-there vertical drift + breath. Wrap anything that should feel
 * alive instead of printed on the screen.
 */
export function Float({
  children,
  distance = 5,
  duration = 7000,
  delay = 0,
  scaleAmount = 0.012,
  style,
}: {
  children: React.ReactNode;
  distance?: number;
  duration?: number;
  delay?: number;
  scaleAmount?: number;
  style?: ViewStyle;
}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration, delay]);

  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] });
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 1 + scaleAmount] });

  return <Animated.View style={[style, { transform: [{ translateY }, { scale }] }]}>{children}</Animated.View>;
}

/**
 * Horizontal swipe navigation between sibling screens (home ⇄ library ⇄ profile).
 */
export function SwipeNav({
  children,
  left,
  right,
}: {
  children: React.ReactNode;
  /** route to go to when swiping right (revealing the screen on the left) */
  left?: string;
  /** route to go to when swiping left */
  right?: string;
}) {
  const router = useRouter();
  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 26 && Math.abs(g.dx) > Math.abs(g.dy) * 2,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -64 && right) router.navigate(right as any);
        else if (g.dx > 64 && left) router.navigate(left as any);
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...responder.panHandlers}>
      {children}
    </View>
  );
}

/**
 * Concentric ripples blooming outward — the visual heartbeat of the
 * generating screen.
 */
export function Ripples({
  size = 300,
  color = 'rgba(255,255,255,0.8)',
  count = 3,
}: {
  size?: number;
  color?: string;
  count?: number;
}) {
  const waves = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = waves.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay((i * 5200) / count),
          Animated.timing(v, { toValue: 1, duration: 5200, easing: Easing.out(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [waves, count]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} pointerEvents="none">
      {waves.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: color,
            opacity: v.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 0.7, 0] }),
            transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.05] }) }],
          }}
        />
      ))}
    </View>
  );
}
