import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useApp } from '../store';
import { FONTS, RADII } from '../theme';
import { ArrowLeft } from './Icons';

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
      <Pressable onPress={onPress} style={({ pressed }) => [style, { opacity: pressed ? 0.85 : 1 }]}>
        {inner}
      </Pressable>
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
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
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
    </Pressable>
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        {
          backgroundColor: dark ? 'rgba(240,244,255,0.92)' : 'rgba(255,255,255,0.75)',
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 16, color: '#23284a' }}>{label}</Text>
    </Pressable>
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
