import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { FigureBackdrop } from '../src/components/FigureArt';
import { Brand } from '../src/components/KeiroLogo';
import { MicroLabel, PrimaryButton, Tap, ThemeToggle } from '../src/components/UI';
import { Check } from '../src/components/Icons';
import { Sparkle } from '../src/components/Sparkle';
import { useApp } from '../src/store';
import { FONTS, RADII } from '../src/theme';

/**
 * Subscription screen. The purchase is simulated for now; RevenueCat or
 * the native store SDKs plug into `subscribe()` when shipping.
 */
export default function Paywall() {
  const { t, palette, setPlan, plan } = useApp();
  const router = useRouter();
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const dark = palette.name === 'dark';

  const subscribe = () => {
    setPlan('premium');
    router.back();
  };

  const PlanCard = ({ id, label, price, badge }: { id: 'monthly' | 'yearly'; label: string; price: string; badge?: string }) => {
    const sel = period === id;
    return (
      <Tap onPress={() => setPeriod(id)} style={{ flex: 1 }} scaleTo={0.96}>
        <BlurView
          intensity={28}
          tint={dark ? 'dark' : 'light'}
          style={[
            styles.plan,
            {
              backgroundColor: sel ? palette.selectedBg : palette.glass,
              borderColor: sel ? palette.selectedBorder : palette.glassBorder,
            },
          ]}
        >
          {badge && (
            <View style={[styles.badge, { backgroundColor: palette.accent }]}>
              <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 10, color: '#3a3550' }}>{badge}</Text>
            </View>
          )}
          <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 15, color: palette.text }}>{label}</Text>
          <Text style={{ fontFamily: FONTS.serif, fontSize: 21, color: palette.text, marginTop: 4 }}>{price}</Text>
        </BlurView>
      </Tap>
    );
  };

  return (
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: palette.bg[0] }}>
      <FigureBackdrop name="profile-violet" fadeTo={palette.bg[0]}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <View style={{ width: 44 }} />
            <Brand color="rgba(255,255,255,0.9)" />
            <ThemeToggle />
          </View>

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={{ flex: 1 }} />
            <MicroLabel color="rgba(255,255,255,0.7)">{t('pw_label')}</MicroLabel>
            <Text style={styles.title}>{t('pw_title')}</Text>

            <View style={{ gap: 10, marginTop: 22, alignSelf: 'stretch' }}>
              {['pw_f1', 'pw_f2', 'pw_f3'].map((k) => (
                <View key={k} style={styles.featRow}>
                  <Check color="#ffe9b8" size={17} />
                  <Text style={styles.feat}>{t(k)}</Text>
                </View>
              ))}
            </View>

            {plan === 'premium' ? (
              <View style={{ marginTop: 28, alignItems: 'center', gap: 16, alignSelf: 'stretch' }}>
                <View style={styles.featRow}>
                  <Sparkle size={16} color="#ffe9b8" />
                  <Text style={[styles.feat, { fontFamily: FONTS.sansMedium }]}>{t('pw_active')}</Text>
                </View>
                <Tap onPress={() => { setPlan('free'); }} hitSlop={8}>
                  <Text style={styles.later}>{t('pw_cancel')}</Text>
                </Tap>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 28, alignSelf: 'stretch' }}>
                  <PlanCard id="monthly" label={t('pw_monthly')} price={t('pw_price_m')} />
                  <PlanCard id="yearly" label={t('pw_yearly')} price={t('pw_price_y')} badge={t('pw_save')} />
                </View>

                <View style={{ marginTop: 22, alignSelf: 'stretch', gap: 14 }}>
                  <PrimaryButton label={t('pw_cta')} onPress={subscribe} />
                  <Tap onPress={() => router.back()} hitSlop={8} style={{ alignItems: 'center' }}>
                    <Text style={styles.later}>{t('pw_later')}</Text>
                  </Tap>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </FigureBackdrop>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 2,
  },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 28, paddingBottom: 30 },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 38,
    lineHeight: 46,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 10,
  },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' },
  feat: { fontFamily: FONTS.sans, fontSize: 14.5, color: 'rgba(255,255,255,0.92)' },
  plan: {
    borderRadius: RADII.card,
    borderWidth: 1.4,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 20,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  later: { fontFamily: FONTS.sans, fontSize: 14, color: 'rgba(255,255,255,0.75)' },
});
