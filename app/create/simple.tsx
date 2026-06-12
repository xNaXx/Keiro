import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GradientBackground } from '../../src/components/GradientBackground';
import { MoodOrb } from '../../src/components/MoodOrb';
import { BackButton, MicroLabel, Title } from '../../src/components/UI';
import { useApp } from '../../src/store';
import { FONTS, MOOD_PALETTES, RADII } from '../../src/theme';
import { MOODS } from '../../src/data';

export default function SimpleScreen() {
  const { t, palette, language } = useApp();
  const router = useRouter();
  const dark = palette.name === 'dark';

  const choose = (mood: string) => {
    router.push({ pathname: '/create/generating', params: { mood, mode: 'simple' } });
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.fill}>
        <View style={styles.header}>
          <BackButton />
          <MicroLabel>{t('mood_label')}</MicroLabel>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Title>{t('simple_title')}</Title>

          <View style={styles.grid}>
            {MOODS.map((m) => {
              const mp = MOOD_PALETTES[m.id][palette.name];
              return (
                <Pressable
                  key={m.id}
                  onPress={() => choose(m.id)}
                  style={({ pressed }) => [styles.cell, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
                >
                  <BlurView
                    intensity={24}
                    tint={dark ? 'dark' : 'light'}
                    style={[styles.cellInner, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
                  >
                    <MoodOrb size={68} color={mp.figure[1]} core={mp.figure[2]} ring={palette.line} />
                    <Text style={[styles.moodName, { color: palette.text }]}>{m.label[language]}</Text>
                  </BlurView>
                </Pressable>
              );
            })}
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
  moodName: { fontFamily: FONTS.sansMedium, fontSize: 15 },
});
