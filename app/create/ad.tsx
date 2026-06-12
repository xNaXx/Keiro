import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GradientBackground } from '../../src/components/GradientBackground';
import { Body, MicroLabel, PrimaryButton, Tap } from '../../src/components/UI';
import { Sparkle } from '../../src/components/Sparkle';
import { Brand } from '../../src/components/KeiroLogo';
import { useApp } from '../../src/store';
import { FONTS, RADII } from '../../src/theme';

const AD_SECONDS = 5;

/**
 * Free-tier interstitial. In production this slot hosts a real ad SDK
 * (AdMob etc.); the countdown and flow stay identical.
 */
export default function AdScreen() {
  const params = useLocalSearchParams();
  const { t, palette } = useApp();
  const router = useRouter();
  const [left, setLeft] = useState(AD_SECONDS);

  useEffect(() => {
    const iv = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const proceed = () => {
    router.replace({ pathname: '/create/generating', params: params as any });
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.fill}>
        <View style={{ alignItems: 'center', paddingTop: 18 }}>
          <Brand color={palette.text} />
        </View>

        <View style={styles.center}>
          <MicroLabel>{t('ad_label')}</MicroLabel>
          <View style={{ height: 14 }} />
          <BlurView
            intensity={26}
            tint={palette.name === 'dark' ? 'dark' : 'light'}
            style={[styles.adBox, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
          >
            <Sparkle size={18} color={palette.textFaint} twinkle />
            <Text style={{ fontFamily: FONTS.sans, fontSize: 14, color: palette.textFaint, textAlign: 'center' }}>
              {t('ad_fake')}
            </Text>
          </BlurView>

          <View style={{ height: 26 }} />
          <Text style={[styles.count, { color: palette.text }]}>
            {left > 0 ? t('ad_title', { s: left }) : t('ad_title', { s: 0 }).replace('0…', '…')}
          </Text>
          <View style={{ height: 8 }} />
          <Body faint>{t('ad_body')}</Body>

          <Tap onPress={() => router.push('/paywall')} style={{ marginTop: 22 }} hitSlop={8}>
            <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 14, color: palette.text, textDecorationLine: 'underline' }}>
              {t('ad_remove')}
            </Text>
          </Tap>
        </View>

        <View style={{ paddingHorizontal: 28, paddingBottom: 28 }}>
          <PrimaryButton
            label={left > 0 ? `${t('ad_continue')} · ${left}` : t('ad_continue')}
            onPress={left > 0 ? undefined : proceed}
            style={{ opacity: left > 0 ? 0.45 : 1 }}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  adBox: {
    alignSelf: 'stretch',
    height: 220,
    borderRadius: RADII.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  count: { fontFamily: FONTS.serif, fontSize: 24, textAlign: 'center' },
});
