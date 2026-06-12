import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Float } from './Motion';

/**
 * Full-bleed figure artwork (v02). The PNGs live in assets/figures/ — drop in
 * replacements with the same filenames to swap the art without touching code.
 * A very slow breathing scale gives the stills a quiet life.
 */
export type FigureName = 'lotus' | 'warm' | 'profile-light' | 'profile-violet' | 'standing';

const FIGURES: Record<FigureName, any> = {
  lotus: require('../../assets/figures/lotus.png'),
  warm: require('../../assets/figures/warm.png'),
  'profile-light': require('../../assets/figures/profile-light.png'),
  'profile-violet': require('../../assets/figures/profile-violet.png'),
  standing: require('../../assets/figures/standing.png'),
};

export function FigureBackdrop({
  name,
  /** fade the bottom into this color so sheets/cards sit comfortably */
  fadeTo,
  children,
}: {
  name: FigureName;
  fadeTo?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.fill}>
      <Float distance={8} duration={12000} scaleAmount={0.045} style={StyleSheet.absoluteFill as any}>
        <Image source={FIGURES[name]} style={styles.img} resizeMode="cover" />
      </Float>
      {fadeTo && (
        <LinearGradient
          colors={['transparent', 'transparent', fadeTo]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      )}
      {children}
    </View>
  );
}

/** Inline (non-fullscreen) figure, e.g. onboarding slides. */
export function FigureImage({
  name,
  width,
  height,
  radius = 36,
}: {
  name: FigureName;
  width: number;
  height: number;
  radius?: number;
}) {
  return (
    <Float distance={5} duration={9000} scaleAmount={0.02}>
      <Image
        source={FIGURES[name]}
        style={{ width, height, borderRadius: radius }}
        resizeMode="cover"
      />
    </Float>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  img: { width: '100%', height: '100%' },
});
