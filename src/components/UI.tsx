import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useApp } from '../store';
import { FONTS, RADII } from '../theme';
import { ArrowLeft, Gear, Home, Lock, Moon, Sun } from './Icons';
import { fadeTheme } from '../themeFade';

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
  const dim = useRef(new Animated.Value(1)).current;
  const soft = Math.min(1, scaleTo + (1 - scaleTo) * 0.7); // keep movement tiny

  const down = () => {
    Animated.parallel([
      Animated.timing(scale, { toValue: soft, duration: 180, useNativeDriver: true }),
      Animated.timing(dim, { toValue: 0.72, duration: 180, useNativeDriver: true }),
    ]).start();
  };
  const up = () => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(dim, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start();
  };
  // mouse clicks are near-instant: guarantee a visible soft pulse anyway
  const pulse = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, { toValue: soft, duration: 140, useNativeDriver: true }),
        Animated.timing(dim, { toValue: 0.72, duration: 140, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(dim, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
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
      <Animated.View style={{ transform: [{ scale }], opacity: dim }}>{children}</Animated.View>
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

/** Tiny lock badge over a gated control. */
export function LockBadge() {
  const { palette } = useApp();
  return (
    <View
      style={{
        position: 'absolute',
        top: -3,
        right: -3,
        width: 17,
        height: 17,
        borderRadius: 9,
        backgroundColor: palette.name === 'dark' ? 'rgba(240,244,255,0.92)' : 'rgba(58,53,80,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Lock color={palette.name === 'dark' ? '#10142e' : '#fff'} size={10} strokeWidth={2} />
    </View>
  );
}

/** Always-visible light/dark switch. Dark mode is a premium perk. */
export function ThemeToggle() {
  const { palette, setThemeMode, plan, showUpgrade } = useApp();
  const dark = palette.name === 'dark';
  const locked = plan === 'free';
  return (
    <View style={locked ? { opacity: 0.45 } : undefined}>
      <GlassIconButton
        onPress={() =>
          locked ? showUpgrade() : fadeTheme(() => setThemeMode(dark ? 'light' : 'dark'))
        }
      >
        {dark ? <Sun color={palette.text} size={19} /> : <Moon color={palette.text} size={18} />}
      </GlassIconButton>
    </View>
  );
}

/** Straight back to home from anywhere in the create flow. */
export function HomeButton() {
  const router = useRouter();
  const { palette } = useApp();
  return (
    <GlassIconButton onPress={() => router.dismissTo('/home')}>
      <Home color={palette.text} size={19} />
    </GlassIconButton>
  );
}

/** Header actions for the create flow: home + theme + settings. */
export function CreateHeaderActions() {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <HomeButton />
      <ThemeToggle />
      <SettingsButton />
    </View>
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
  return (
    <Tap onPress={onPress} style={style} scaleTo={0.97}>
      <BlurView
        intensity={32}
        tint={palette.name === 'dark' ? 'dark' : 'light'}
        style={[
          styles.primary,
          { backgroundColor: palette.glassStrong, borderColor: palette.line, borderWidth: 1 },
        ]}
      >
        <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 16, color: palette.text }}>{label}</Text>
      </BlurView>
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
    overflow: 'hidden',
  },
});
