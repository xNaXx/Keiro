import React, { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../src/components/GradientBackground';
import { FigureImage, FigureName } from '../src/components/FigureArt';
import { PathTrail } from '../src/components/PathTrail';
import { KeiroLogo } from '../src/components/KeiroLogo';
import { Body, MicroLabel, PrimaryButton, Title } from '../src/components/UI';
import { useApp } from '../src/store';
import { FONTS, MOOD_PALETTES } from '../src/theme';

const SLIDES: { figure: FigureName; titleKey: string; bodyKey: string }[] = [
  { figure: 'profile-light', titleKey: 'ob1_title', bodyKey: 'ob1_body' },
  { figure: 'lotus', titleKey: 'ob2_title', bodyKey: 'ob2_body' },
  { figure: 'warm', titleKey: 'ob3_title', bodyKey: 'ob3_body' },
];

export default function Onboarding() {
  const { t, palette, setOnboarded } = useApp();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const finish = () => {
    setOnboarded(true);
    router.replace('/auth');
  };

  const next = () => {
    if (page === SLIDES.length - 1) return finish();
    scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.fill}>
        <View style={styles.topRow}>
          <KeiroLogo size={20} color={palette.text} />
          <Pressable onPress={finish} hitSlop={12}>
            <Text style={{ fontFamily: FONTS.sans, color: palette.textFaint, fontSize: 14 }}>{t('skip')}</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          style={styles.fill}
        >
          {SLIDES.map((s, i) => {
            return (
              <View key={i} style={[styles.slide, { width }]}>
                <View style={styles.figureWrap}>
                  <FigureImage name={s.figure} width={250} height={290} />
                </View>
                <MicroLabel>{t('ob_tag')}</MicroLabel>
                <View style={{ height: 14 }} />
                <Title>{t(s.titleKey)}</Title>
                <View style={{ height: 14 }} />
                <View style={{ paddingHorizontal: 44 }}>
                  <Body>{t(s.bodyKey)}</Body>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <PathTrail
            width={180}
            height={44}
            progress={page / (SLIDES.length - 1)}
            color={palette.line}
            faint={palette.textFaint}
          />
          <PrimaryButton label={page === SLIDES.length - 1 ? t('begin') : t('continue')} onPress={next} style={{ alignSelf: 'stretch' }} />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 18,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { fontFamily: FONTS.serif, fontSize: 22, letterSpacing: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', paddingBottom: 30 },
  figureWrap: { height: 300, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  footer: { alignItems: 'center', gap: 18, paddingHorizontal: 28, paddingBottom: 28 },
});
