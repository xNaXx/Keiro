import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

/**
 * The overlapping thin-line circles that frame the mood word in the
 * references — like petals of a flower drawn with a single hairline.
 */
export function RingFlower({
  size = 260,
  color = 'rgba(255,255,255,0.8)',
  rotate = true,
  children,
}: {
  size?: number;
  color?: string;
  rotate?: boolean;
  children?: React.ReactNode;
}) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!rotate) return;
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 90000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotate, spin]);

  const rotation = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const r = 100;
  const offsets = [
    { x: 0, y: 0 },
    { x: 14, y: -6 },
    { x: -12, y: 8 },
    { x: 6, y: 14 },
    { x: -8, y: -12 },
  ];

  return (
    <Animated.View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        style={{ position: 'absolute', width: size, height: size, transform: [{ rotate: rotation }] }}
      >
        <Svg width={size} height={size} viewBox="0 0 260 260">
          <G>
            {offsets.map((o, i) => (
              <Circle
                key={i}
                cx={130 + o.x}
                cy={130 + o.y}
                r={r - i * 3}
                stroke={color}
                strokeWidth={0.8}
                fill="none"
                opacity={0.55 + i * 0.08}
              />
            ))}
          </G>
        </Svg>
      </Animated.View>
      {children}
    </Animated.View>
  );
}
