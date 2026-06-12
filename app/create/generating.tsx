import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { FigureBackdrop } from '../../src/components/FigureArt';
import { Ripples } from '../../src/components/Motion';
import { Sparkle } from '../../src/components/Sparkle';
import { Brand } from '../../src/components/KeiroLogo';
import { useApp } from '../../src/store';
import { FONTS, MOOD_PALETTES } from '../../src/theme';
import { EnergyId, MomentId, SessionConfig, currentMoment } from '../../src/data';
import { generateMeditation } from '../../src/services/generator';
import { hasElevenLabsKey, synthesize } from '../../src/services/elevenlabs';

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
    sound?: string;
    hz?: string;
    density?: string;
  }>();
  const { t, palette, language, preferredVoice, addSession, user } = useApp();
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const started = useRef(false);

  const mood = params.mood ?? 'calm';
  const mp = MOOD_PALETTES[mood]?.[palette.name] ?? MOOD_PALETTES.calm[palette.name];
  const dark = palette.name === 'dark';

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
      soundType: (params.sound as any) ?? 'ambient',
      hzFreq: params.hz ? Number(params.hz) : undefined,
      density: (params.density as any) ?? 'medium',
      userGender: user?.gender ?? 'male',
    };

    const phases = setInterval(() => setPhase((p) => (p + 1) % 4), 1700);
    const minWait = new Promise((r) => setTimeout(r, 4200));

    Promise.all([generateMeditation(config), minWait]).then(async ([meditation]) => {
      clearInterval(phases);
      if (hasElevenLabsKey()) {
        setPhase(4); // gen_5: "Composing your voice…"
        try {
          const audioUri = await synthesize(
            meditation.lines.map((l) => l.text),
            config.voiceId,
            config.energy
          );
          meditation = { ...meditation, audioUri };
        } catch {
          // synthesis failed — silently fall back to demo mode
        }
      }
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
    <View style={{ flex: 1, backgroundColor: mp.bg[0] }}>
      <FigureBackdrop name="lotus" fadeTo={mp.bg[2]}>
        <View style={styles.ripples} pointerEvents="none">
          <Ripples size={340} color="rgba(255,255,255,0.75)" />
        </View>

        <SafeAreaView style={styles.fill}>
          <View style={{ flex: 1 }} />
          <View style={styles.bottom}>
            <BlurView
              intensity={30}
              tint={dark ? 'dark' : 'light'}
              style={[styles.card, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
            >
              <Sparkle size={15} color={palette.text} twinkle />
              <Text style={[styles.title, { color: palette.text }]}>{t('gen_title')}</Text>
              <Animated.Text style={[styles.phase, { color: palette.textSoft, opacity: fade }]}>
                {t(`gen_${phase + 1}`)}
              </Animated.Text>
            </BlurView>
            <Brand color="rgba(255,255,255,0.85)" />
          </View>
        </SafeAreaView>
      </FigureBackdrop>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  ripples: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { alignItems: 'center', gap: 20, paddingHorizontal: 28, paddingBottom: 34 },
  card: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
  },
  title: { fontFamily: FONTS.serif, fontSize: 27 },
  phase: { fontFamily: FONTS.sans, fontSize: 14.5 },
});
