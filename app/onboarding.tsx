import React, { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
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
import { FONTS } from '../src/theme';

const SLIDES: { figure: FigureName; titleKey: string; bodyKey: string }[] = [
  { figure: 'profile-light', titleKey: 'ob1_title', bodyKey: 'ob1_body' },
  { figure: 'lotus', titleKey: 'ob2_title', bodyKey: 'ob2_body' },
  { figure: 'warm', titleKey: 'ob3_title', bodyKey: 'ob3_body' },
];
const PAGES = SLIDES.length;

export default function Onboarding() {
  const { t, palette, setOnboarded } = useApp();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);
  const x = useRef(new Animated.Value(0)).current;

  const finish = () => {
    setOnboarded(true);
    router.replace('/auth');
  };

  const snapTo = (idx: number) => {
    const i = Math.max(0, Math.min(PAGES - 1, idx));
    pageRef.current = i;
    setPage(i);
    Animated.spring(x, { toValue: -i * width, useNativeDriver: true, speed: 10, bounciness: 0 }).start();
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
      onPanResponderMove: (_, g) => {
        const base = -pageRef.current * width;
        let next = base + g.dx;
        if (next > 0) next = next / 3;
        const min = -(PAGES - 1) * width;
        if (next < min) next = min + (next - min) / 3;
        x.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const threshold = width * 0.22;
        if (g.dx < -threshold || g.vx < -0.4) snapTo(pageRef.current + 1);
        else if (g.dx > threshold || g.vx > 0.4) snapTo(pageRef.current - 1);
        else snapTo(pageRef.current);
      },
      onPanResponderTerminate: () => snapTo(pageRef.current),
    })
  ).current;

  const next = () => {
    if (pageRef.current === PAGES - 1) return finish();
    snapTo(pageRef.current + 1);
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

        <View style={{ flex: 1, overflow: 'hidden' }} {...pan.panHandlers}>
          <Animated.View
            style={{
              flexDirection: 'row',
              width: width * PAGES,
              height: '100%',
              transform: [{ translateX: x }],
            }}
          >
            {SLIDES.map((s, i) => (
              <View key={i} style={[styles.slide, { width }]}>
                <View style={styles.figureWrap}>
                  <FigureImage name={s.figure} width={250} maxHeight={300} />
                </View>
                <MicroLabel>{t('ob_tag')}</MicroLabel>
                <View style={{ height: 14 }} />
                <Title>{t(s.titleKey)}</Title>
                <View style={{ height: 14 }} />
                <View style={{ paddingHorizontal: 44 }}>
                  <Body>{t(s.bodyKey)}</Body>
                </View>
              </View>
            ))}
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <PathTrail
            width={180}
            height={44}
            progress={page / (PAGES - 1)}
            color={palette.line}
            faint={palette.textFaint}
          />
          <PrimaryButton
            label={page === PAGES - 1 ? t('begin') : t('continue')}
            onPress={next}
            style={{ alignSelf: 'stretch' }}
          />
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
  slide: { alignItems: 'center', justifyContent: 'center', paddingBottom: 30 },
  figureWrap: { height: 300, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  footer: { alignItems: 'center', gap: 18, paddingHorizontal: 28, paddingBottom: 28 },
});
