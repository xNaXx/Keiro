import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard, HeaderActions, MicroLabel, Tap } from '../components/UI';
import { PathTrail } from '../components/PathTrail';
import { Sparkle } from '../components/Sparkle';
import { Brand } from '../components/KeiroLogo';
import { Float } from '../components/Motion';
import { Play, Plus, VoiceWave } from '../components/Icons';
import { useApp } from '../store';
import { FONTS } from '../theme';
import { MOODS, currentMoment } from '../data';
import { getPrebuilt } from '../prebuilt';

export function HomeView() {
  const { t, palette, user, pathDay, sessions, language } = useApp();
  const router = useRouter();
  const moment = currentMoment();
  const dark = palette.name === 'dark';

  // the + invites: a ring blooms out of it every few seconds
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2600, easing: Easing.out(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(400),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 0.85, 0] });

  const questionKey =
    moment === 'morning' ? 'how_feeling_morning' : moment === 'night' ? 'how_feeling_night' : 'how_feeling_afternoon';

  const last = sessions[0];
  const lastMood = last ? MOODS.find((m) => m.id === last.config.mood) : null;
  const samples = getPrebuilt(language);

  return (
    <>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={{ width: 98 }} />
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Brand color={palette.text} />
              <Text style={[styles.hello, { color: palette.text }]}>
                {t('hello')} {user?.name?.split(' ')[0] ?? ''},
              </Text>
              <Text style={[styles.day, { color: palette.textFaint }]}>{t('day_of_path', { n: pathDay })}</Text>
            </View>
            <HeaderActions />
          </View>

          <View style={styles.center}>
            <Float distance={4} duration={6500} style={{ alignItems: 'center', gap: 18 }}>
              <Sparkle size={16} color={palette.textSoft} twinkle />
              <Text style={[styles.question, { color: palette.text }]}>{t(questionKey)}</Text>
            </Float>

            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.plusRing,
                  { borderColor: '#ffffff', opacity: ringOpacity, transform: [{ scale: ringScale }] },
                ]}
              />
              <Tap onPress={() => router.push('/create/mode')} scaleTo={0.9}>
                <View style={styles.plus}>
                  <Plus color="#ffffff" size={26} strokeWidth={1.3} />
                </View>
              </Tap>
            </View>

            <Float distance={3} duration={9000} delay={800} style={{ marginTop: 34, alignItems: 'center', gap: 8 }}>
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
            </Float>
          </View>

          {last && lastMood && (
            <View style={styles.cards}>
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
            </View>
          )}

          {samples.length > 0 && (
            <View style={styles.samples}>
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <MicroLabel>{t('sample_label')}</MicroLabel>
              </View>
              {samples.map((m) => (
                <GlassCard
                  key={m.id}
                  onPress={() => router.push({ pathname: '/player', params: { id: m.id } })}
                  style={{ marginBottom: 12 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={[styles.voiceOrb, { borderColor: palette.line }]}>
                      <VoiceWave color={palette.text} size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sampleTitle, { color: palette.text }]} numberOfLines={1}>
                        {m.title}
                      </Text>
                      <Text style={{ fontFamily: FONTS.sans, fontSize: 12, color: palette.textFaint, marginTop: 3 }}>
                        {m.voiceName} · {t('sample_real_voice')}
                      </Text>
                    </View>
                    <Play color={palette.textSoft} size={16} />
                  </View>
                </GlassCard>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
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
  hello: { fontFamily: FONTS.sansMedium, fontSize: 17, marginTop: 2 },
  day: { fontFamily: FONTS.sans, fontSize: 13, marginTop: 3 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 18 },
  question: { fontFamily: FONTS.sans, fontSize: 30, lineHeight: 40, textAlign: 'center' },
  plus: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 26px rgba(255,255,255,0.55)',
  },
  plusRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
  },
  cards: { flexDirection: 'row', gap: 14, paddingHorizontal: 24 },
  cardTitle: { fontFamily: FONTS.sansMedium, fontSize: 16, marginTop: 10, lineHeight: 22 },
  samples: { paddingHorizontal: 24, marginTop: 24 },
  voiceOrb: { width: 46, height: 46, borderRadius: 23, borderWidth: 0.8, alignItems: 'center', justifyContent: 'center' },
  sampleTitle: { fontFamily: FONTS.sansMedium, fontSize: 15.5 },
});
