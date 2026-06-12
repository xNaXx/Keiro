import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { GlassCard, HeaderActions, MicroLabel, Tap } from '../../src/components/UI';
import { PathTrail } from '../../src/components/PathTrail';
import { Sparkle } from '../../src/components/Sparkle';
import { Play, Plus } from '../../src/components/Icons';
import { useApp } from '../../src/store';
import { FONTS } from '../../src/theme';
import { MOODS, currentMoment } from '../../src/data';

export default function HomeScreen() {
  const { t, palette, user, pathDay, sessions, language } = useApp();
  const router = useRouter();
  const moment = currentMoment();
  const dark = palette.name === 'dark';

  const questionKey =
    moment === 'morning' ? 'how_feeling_morning' : moment === 'night' ? 'how_feeling_night' : 'how_feeling_afternoon';

  const last = sessions[0];
  const lastMood = last ? MOODS.find((m) => m.id === last.config.mood) : null;

  return (
    <GradientBackground glow={dark ? undefined : ['#ffd9b8', '#f6c4dd']}>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={{ width: 98 }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.hello, { color: palette.text }]}>
                {t('hello')} {user?.name?.split(' ')[0] ?? ''},
              </Text>
              <Text style={[styles.day, { color: palette.textFaint }]}>{t('day_of_path', { n: pathDay })}</Text>
            </View>
            <HeaderActions />
          </View>

          <View style={styles.center}>
            <Sparkle size={16} color={palette.textSoft} twinkle />
            <Text style={[styles.question, { color: palette.text }]}>{t(questionKey)}</Text>

            <Tap onPress={() => router.push('/create/mode')} scaleTo={0.9}>
              <View
                style={[
                  styles.plus,
                  { backgroundColor: dark ? 'rgba(240,244,255,0.92)' : 'rgba(58,53,80,0.85)' },
                ]}
              >
                <Plus color={dark ? '#10142e' : '#fff'} size={26} strokeWidth={2} />
              </View>
            </Tap>

            <View style={{ marginTop: 34, alignItems: 'center', gap: 8 }}>
              <PathTrail
                width={240}
                height={64}
                progress={Math.min(1, ((pathDay - 1) % 30) / 29)}
                color={palette.line}
                faint={palette.textFaint}
              />
              <Text style={{ fontFamily: FONTS.serifItalic, fontSize: 15, color: palette.textFaint }}>
                {t('home_quote_1')}
              </Text>
            </View>
          </View>

          <View style={styles.cards}>
            <GlassCard onPress={() => router.push('/create/mode')} style={{ flex: 1 }}>
              <Sparkle size={15} color={palette.textSoft} />
              <Text style={[styles.cardTitle, { color: palette.text }]}>{t('new_session')}</Text>
            </GlassCard>
            {last && lastMood ? (
              <GlassCard
                onPress={() => router.push({ pathname: '/player', params: { id: last.id } })}
                style={{ flex: 1 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Play color={palette.textSoft} size={14} />
                  <MicroLabel>{t('last_step').toLowerCase()}</MicroLabel>
                </View>
                <Text style={[styles.cardTitle, { color: palette.text }]} numberOfLines={2}>
                  {last.title}
                </Text>
                <Text style={{ fontFamily: FONTS.sans, fontSize: 12, color: palette.textFaint, marginTop: 4 }}>
                  {lastMood.label[language]} · {last.config.durationMin} {t('minutes')}
                </Text>
              </GlassCard>
            ) : (
              <GlassCard style={{ flex: 1 }}>
                <MicroLabel>{t('mood_label')}</MicroLabel>
                <Text style={[styles.cardTitle, { color: palette.text }]}>{t('today_i_feel')}…</Text>
              </GlassCard>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 130 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  hello: { fontFamily: FONTS.sansMedium, fontSize: 18 },
  day: { fontFamily: FONTS.sans, fontSize: 13, marginTop: 3 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 18 },
  question: { fontFamily: FONTS.sans, fontSize: 30, lineHeight: 40, textAlign: 'center' },
  plus: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cards: { flexDirection: 'row', gap: 14, paddingHorizontal: 24 },
  cardTitle: { fontFamily: FONTS.sansMedium, fontSize: 16, marginTop: 10, lineHeight: 22 },
});
