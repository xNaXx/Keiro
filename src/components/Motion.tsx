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
