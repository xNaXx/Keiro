import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useApp } from '../store';
import { FONTS, RADII } from '../theme';
import { ArrowLeft, Gear, Moon, Sun } from './Icons';

/**
 * Pressable with a soft spring scale — every touch in Keiro breathes a
 * little instead of snapping.
 */
export function Tap({
  children,
  onPress,
  style,
  scaleTo = 0.96,
  disabled,
  hitSlop,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  scaleTo?: number;
  disabled?: boolean;
  hitSlop?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressed = useRef(false);

  const down = () => {
    pressed.current = true;
    Animated.timing(scale, { toValue: scaleTo, duration: 110, useNativeDriver: true }).start();
  };
  const up = () => {
    pressed.current = false;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 9 }).start();
  };
  // mouse clicks are near-instant: guarantee a visible pulse anyway
  const pulse = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: scaleTo - 0.02, duration: 90, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 9 }),
    ]).start();
  };

  return (
    <Pressable
      onPress={() => {
        pulse();
        onPress?.();
      }}
      disabled={disabled}
      hitSlop={hitSlop}
      onPressIn={down}
      onPressOut={up}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}

/** Frosted-glass card, the building block of every surface in Keiro. */
export function GlassCard({
  children,
  style,
  strong = false,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  strong?: boolean;
  onPress?: () => void;
}) {
  const { palette } = useApp();
  const inner = (
    <BlurView
      intensity={28}
      tint={palette.name === 'dark' ? 'dark' : 'light'}
      style={[
        styles.card,
        {
          backgroundColor: strong ? palette.glassStrong : palette.glass,
          borderColor: palette.glassBorder,
        },
      ]}
    >
      {children}
    </BlurView>
  );
  if (onPress)
    return (
      <Tap onPress={onPress} style={style} scaleTo={0.97}>
        {inner}
      </Tap>
    );
  return <View style={style}>{inner}</View>;
}

/** Round frosted icon button (top corners of every screen). */
export function GlassIconButton({
  children,
  onPress,
  size = 44,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  size?: number;
}) {
  const { palette } = useApp();
  return (
    <Tap onPress={onPress} scaleTo={0.88}>
      <BlurView
        intensity={24}
        tint={palette.name === 'dark' ? 'dark' : 'light'}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: palette.glass,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: palette.glassBorder,
        }}
      >
        {children}
      </BlurView>
    </Tap>
  );
}

export function BackButton() {
  const router = useRouter();
  const { palette } = useApp();
  return (
    <GlassIconButton onPress={() => router.back()}>
      <ArrowLeft color={palette.text} size={20} />
    </GlassIconButton>
  );
}

/** Always-visible light/dark switch: one tap flips the theme. */
export function ThemeToggle() {
  const { palette, setThemeMode } = useApp();
  const dark = palette.name === 'dark';
  return (
    <GlassIconButton onPress={() => setThemeMode(dark ? 'light' : 'dark')}>
      {dark ? <Sun color={palette.text} size={19} /> : <Moon color={palette.text} size={18} />}
    </GlassIconButton>
  );
}

/** Settings shortcut, paired with the theme toggle in screen headers. */
export function SettingsButton() {
  const router = useRouter();
  const { palette } = useApp();
  return (
    <GlassIconButton onPress={() => router.push('/settings')}>
      <Gear color={palette.text} size={19} />
    </GlassIconButton>
  );
}

/** Standard header actions: theme switch + settings gear. */
export function HeaderActions() {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <ThemeToggle />
      <SettingsButton />
    </View>
  );
}

/** Tiny letter-spaced label, e.g. "m o o d". */
export function MicroLabel({ children, color }: { children: string; color?: string }) {
  const { palette } = useApp();
  return (
    <Text
      style={{
        fontFamily: FONTS.sans,
        fontSize: 11,
        letterSpacing: 5,
        textTransform: 'lowercase',
        color: color ?? palette.textFaint,
        textAlign: 'center',
      }}
    >
      {children}
    </Text>
  );
}

/** Big screen title in light sans, like "Today I feel". */
export function Title({ children, center = true, size = 28 }: { children: string; center?: boolean; size?: number }) {
  const { palette } = useApp();
  return (
    <Text
      style={{
        fontFamily: FONTS.sans,
        fontSize: size,
        lineHeight: size * 1.25,
        color: palette.text,
        textAlign: center ? 'center' : 'left',
        fontWeight: '400',
      }}
    >
      {children}
    </Text>
  );
}

export function Body({ children, center = true, faint = false }: { children: string; center?: boolean; faint?: boolean }) {
  const { palette } = useApp();
  return (
    <Text
      style={{
        fontFamily: FONTS.sans,
        fontSize: 15,
        lineHeight: 23,
        color: faint ? palette.textFaint : palette.textSoft,
        textAlign: center ? 'center' : 'left',
      }}
    >
      {children}
    </Text>
  );
}

export function PrimaryButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const { palette } = useApp();
  const dark = palette.name === 'dark';
  return (
    <Tap onPress={onPress} style={style} scaleTo={0.97}>
      <View
        style={[
          styles.primary,
          { backgroundColor: dark ? 'rgba(240,244,255,0.92)' : 'rgba(255,255,255,0.75)' },
        ]}
      >
        <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 16, color: '#23284a' }}>{label}</Text>
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADII.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    padding: 22,
  },
  primary: {
    height: 56,
    borderRadius: RADII.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
});
