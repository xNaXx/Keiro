import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, {
  Defs,
  Ellipse,
  FeGaussianBlur,
  Filter,
  G,
  LinearGradient,
  Mask,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

export type Pose = 'bowed' | 'gazing' | 'sitting';

/**
 * The blurred human silhouette from the reference art: a soft figure made of
 * light, with a warm glowing core, breathing slowly.
 */
export function AuroraFigure({
  pose = 'gazing',
  width = 300,
  height = 340,
  colors,
  breathe = true,
}: {
  pose?: Pose;
  width?: number;
  height?: number;
  /** [outer, mid, glow core] */
  colors: [string, string, string];
  breathe?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!breathe) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.03,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathe, scale]);

  const [outer, mid, core] = colors;

  // Body + head outlines for each pose (300x340 viewBox).
  const shapes = {
    bowed: {
      // hunched back rising on the left, head dropped forward on the right
      body: 'M96 340 C94 270 96 210 110 168 C122 132 142 116 164 122 C186 128 196 152 202 190 C210 240 214 290 216 340 Z',
      head: { cx: 190, cy: 104, rx: 32, ry: 37, rot: 38 },
      core: { cx: 156, cy: 220, rx: 50, ry: 64 },
    },
    gazing: {
      // chest open, chin lifted toward the light
      body: 'M102 340 C102 272 106 216 116 178 C126 142 142 126 160 128 C182 132 196 162 202 204 C208 250 210 296 212 340 Z',
      head: { cx: 158, cy: 84, rx: 33, ry: 41, rot: -18 },
      core: { cx: 152, cy: 130, rx: 46, ry: 58 },
    },
    sitting: {
      // grounded mound, head resting centered
      body: 'M76 340 C78 290 86 240 102 200 C118 162 134 144 150 144 C166 144 182 162 198 200 C214 240 222 290 224 340 Z',
      head: { cx: 150, cy: 104, rx: 38, ry: 42, rot: 0 },
      core: { cx: 150, cy: 240, rx: 58, ry: 70 },
    },
  }[pose];

  return (
    <Animated.View style={{ width, height, transform: [{ scale }] }}>
      <Svg width={width} height={height} viewBox="0 0 300 340">
        <Defs>
          <Filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
            <FeGaussianBlur in="SourceGraphic" stdDeviation="9" />
          </Filter>
          <Filter id="softer" x="-80%" y="-80%" width="260%" height="260%">
            <FeGaussianBlur in="SourceGraphic" stdDeviation="26" />
          </Filter>
          <RadialGradient id="bodyGrad" cx="50%" cy="40%" r="75%">
            <Stop offset="0%" stopColor={mid} stopOpacity="0.95" />
            <Stop offset="70%" stopColor={outer} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={outer} stopOpacity="0.35" />
          </RadialGradient>
          <RadialGradient id="coreGrad" cx="50%" cy="50%" r="60%">
            <Stop offset="0%" stopColor={core} stopOpacity="0.95" />
            <Stop offset="100%" stopColor={core} stopOpacity="0" />
          </RadialGradient>
          {/* the figure dissolves into light toward the bottom instead of being cut */}
          <LinearGradient id="fadeY" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#fff" stopOpacity="1" />
            <Stop offset="0.68" stopColor="#fff" stopOpacity="1" />
            <Stop offset="1" stopColor="#fff" stopOpacity="0" />
          </LinearGradient>
          <Mask id="fadeMask">
            <Rect x="0" y="0" width="300" height="340" fill="url(#fadeY)" />
          </Mask>
        </Defs>

        <G mask="url(#fadeMask)">
          {/* halo */}
          <Ellipse cx="150" cy="190" rx="125" ry="150" fill="url(#bodyGrad)" opacity="0.35" filter="url(#softer)" />
          {/* body */}
          <Path d={shapes.body} fill="url(#bodyGrad)" filter="url(#soft)" />
          {/* head */}
          <Ellipse
            cx={shapes.head.cx}
            cy={shapes.head.cy}
            rx={shapes.head.rx}
            ry={shapes.head.ry}
            fill="url(#bodyGrad)"
            filter="url(#soft)"
            transform={`rotate(${shapes.head.rot} ${shapes.head.cx} ${shapes.head.cy})`}
          />
          {/* glowing core */}
          <Ellipse
            cx={shapes.core.cx}
            cy={shapes.core.cy}
            rx={shapes.core.rx}
            ry={shapes.core.ry}
            fill="url(#coreGrad)"
            filter="url(#softer)"
          />
        </G>
      </Svg>
    </Animated.View>
  );
}
