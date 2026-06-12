import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useApp } from '../store';
import { FONTS, RADII } from '../theme';
import { Sparkle } from './Sparkle';
import { PrimaryButton, Tap } from './UI';

/** Soft glass popup shown when a free user touches a premium feature. */
export function UpgradeModal() {
  const { t, palette, upgradeVisible, hideUpgrade } = useApp();
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: upgradeVisible ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [upgradeVisible, fade]);

  if (!upgradeVisible) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fade }]}>
      {/* the whole screen blurs and dims behind the card */}
      <BlurView
        intensity={36}
        tint={palette.name === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <Tap onPress={hideUpgrade} style={StyleSheet.absoluteFill as any}>
        <View style={{ flex: 1 }} />
      </Tap>
      {/* near-solid card: expo-blur on web overrides backgroundColor, so no blur here */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: palette.name === 'dark' ? 'rgba(36,28,62,0.97)' : 'rgba(252,250,255,0.97)',
            borderColor: palette.glassBorder,
          },
        ]}
      >
        <Sparkle size={18} color={palette.text} twinkle />
        <Text style={[styles.title, { color: palette.text }]}>{t('up_title')}</Text>
        <Text style={[styles.body, { color: palette.textSoft }]}>{t('up_body')}</Text>
        <PrimaryButton
          label={t('up_cta')}
          onPress={() => {
            hideUpgrade();
            router.push('/paywall');
          }}
          style={{ alignSelf: 'stretch', marginTop: 6 }}
        />
        <Tap onPress={hideUpgrade} hitSlop={8}>
          <Text style={{ fontFamily: FONTS.sans, fontSize: 14, color: palette.textFaint }}>{t('up_no')}</Text>
        </Tap>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(20,15,40,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  card: {
    width: '82%',
    maxWidth: 360,
    borderRadius: RADII.card,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  title: { fontFamily: FONTS.serif, fontSize: 26 },
  body: { fontFamily: FONTS.sans, fontSize: 14.5, lineHeight: 21, textAlign: 'center' },
});
