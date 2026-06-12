import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { FigureBackdrop } from '../../src/components/FigureArt';
import { RingFlower } from '../../src/components/RingFlower';
import { Sparkle } from '../../src/components/Sparkle';
import { Brand } from '../../src/components/KeiroLogo';
import { useApp } from '../../src/store';
import { FONTS, MOOD_PALETTES } from '../../src/theme';
import { EnergyId, MomentId, SessionConfig, currentMoment } from '../../src/data';
import { generateMeditation } from '../../src/services/generator';

/** In simple mode the "AI" chooses the rest of the session for you. */
const ENERGY_FOR_MOOD: Record<string, EnergyId> = {
  anxiety: 'serene',
  sadness: 'warm',
  worry: 'serene',
  stress: 'whisper',
  insomnia: 'whisper',
  calm: 'serene',
  gratitude: 'warm',
  focus: 'bright',
};

export default function GeneratingScreen() {
  const params = useLocalSearchParams<{
    mood: string;
    mode: 'simple' | 'advanced';
    moment?: string;
    duration?: string;
    voice?: string;
    energy?: string;
  }>();
  const { t, palette, language, preferredVoice, addSession } = useApp();
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const started = useRef(false);

  const mood = params.mood ?? 'calm';
  const mp = MOOD_PALETTES[mood]?.[palette.name] ?? MOOD_PALETTES.calm[palette.name];

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const moment = (params.moment as MomentId) ?? currentMoment();
    const config: SessionConfig = {
      mood,
      moment,
      durationMin: params.duration ? Number(params.duration) : moment === 'night' ? 10 : 5,
      voiceId: params.voice ?? preferredVoice,
      energy: (params.energy as EnergyId) ?? ENERGY_FOR_MOOD[mood] ?? 'serene',
      language,
      mode: params.mode ?? 'simple',
    };

    const phases = setInterval(() => setPhase((p) => (p + 1) % 4), 1700);
    const minWait = new Promise((r) => setTimeout(r, 4200));

    Promise.all([generateMeditation(config), minWait]).then(([meditation]) => {
      clearInterval(phases);
      addSession(meditation);
      router.replace({ pathname: '/player', params: { id: meditation.id, fresh: '1' } });
    });

    return () => clearInterval(phases);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [phase, fade]);

  return (
    <GradientBackground colors={mp.bg}>
      <SafeAreaView style={styles.fill}>
        <View style={styles.center}>
          <RingFlower size={320} color={palette.line}>
            <View style={{ width: 240, height: 240, borderRadius: 120, overflow: 'hidden' }}>
              <FigureBackdrop name="lotus" />
            </View>
          </RingFlower>

          <View style={{ alignItems: 'center', gap: 14, marginTop: 10 }}>
            <Sparkle size={16} color={palette.text} twinkle />
            <Text style={[styles.title, { color: palette.text }]}>{t('gen_title')}</Text>
            <Animated.Text style={[styles.phase, { color: palette.textSoft, opacity: fade }]}>
              {t(`gen_${phase + 1}`)}
            </Animated.Text>
          </View>
        </View>
        <View style={{ alignItems: 'center', paddingBottom: 36 }}>
          <Brand color={palette.textSoft} />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  title: { fontFamily: FONTS.serif, fontSize: 28 },
  phase: { fontFamily: FONTS.sans, fontSize: 14.5 },
});
