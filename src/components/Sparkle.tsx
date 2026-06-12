import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** Four-pointed star pictogram used across the app, optionally twinkling. */
export function Sparkle({
  size = 24,
  color = '#ffffff',
  twinkle = false,
  style,
}: {
  size?: number;
  color?: string;
  twinkle?: boolean;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!twinkle) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 1600 + Math.random() * 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1600 + Math.random() * 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [twinkle, opacity]);

  return (
    <Animated.View style={[{ opacity: twinkle ? opacity : 1 }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 0 C12.9 7.5 16.5 11.1 24 12 C16.5 12.9 12.9 16.5 12 24 C11.1 16.5 7.5 12.9 0 12 C7.5 11.1 11.1 7.5 12 0 Z"
          fill={color}
        />
      </Svg>
    </Animated.View>
  );
}
