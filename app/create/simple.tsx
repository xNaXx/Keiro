import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GradientBackground } from '../../src/components/GradientBackground';
import { MoodIcon } from '../../src/components/MoodIcon';
import { Brand } from '../../src/components/KeiroLogo';
import { BackButton, CreateHeaderActions, MicroLabel, Tap, Title } from '../../src/components/UI';
import { useApp } from '../../src/store';
import { FONTS, RADII } from '../../src/theme';
import { MOODS } from '../../src/data';

export default function SimpleScreen() {
  const { t, palette, language, plan } = useApp();
  const router = useRouter();
  const dark = palette.name === 'dark';

  const choose = (mood: string) => {
    router.push({ pathname: plan === 'free' ? '/create/ad' : '/create/generating', params: { mood, mode: 'simple' } });
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.fill}>
        <View style={styles.header}>
          <BackButton />
          <Brand color={palette.text} />
          <CreateHeaderActions />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Title>{t('simple_title')}</Title>

          <View style={styles.grid}>
            {MOODS.map((m) => (
              <Tap key={m.id} onPress={() => choose(m.id)} style={styles.cell} scaleTo={0.95}>
                <BlurView
                  intensity={24}
                  tint={dark ? 'dark' : 'light'}
                  style={[styles.cellInner, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
                >
                  <View style={[styles.iconRing, { borderColor: palette.line }]}>
                    <MoodIcon mood={m.id} size={30} color={palette.text} strokeWidth={1.3} />
                  </View>
                  <Text style={[styles.moodName, { color: palette.text }]}>{m.label[language]}</Text>
                </BlurView>
              </Tap>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  scroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 34,
    justifyContent: 'center',
  },
  cell: { width: '46%' },
  cellInner: {
    borderRadius: RADII.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 26,
    gap: 14,
  },
  iconRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodName: { fontFamily: FONTS.sansMedium, fontSize: 15 },
});
