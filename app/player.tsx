import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GradientBackground } from '../src/components/GradientBackground';
import { AuroraFigure } from '../src/components/AuroraFigure';
import { RingFlower } from '../src/components/RingFlower';
import { Sparkle } from '../src/components/Sparkle';
import { BackButton, MicroLabel, PrimaryButton } from '../src/components/UI';
import { Check, Download, Pause, Play, SkipBack, SkipFwd } from '../src/components/Icons';
import { useApp } from '../src/store';
import { FONTS, MOOD_PALETTES, RADII } from '../src/theme';
import { MOODS } from '../src/data';
import { hasElevenLabsKey } from '../src/services/elevenlabs';

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function seededHeights(n: number) {
  let s = 11;
  return Array.from({ length: n }, () => {
    s = (s * 9301 + 49297) % 233280;
    return 6 + (s / 233280) * 18;
  });
}

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, palette, sessions, toggleDownload, language } = useApp();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const meditation = sessions.find((s) => s.id === id);
  const mood = MOODS.find((m) => m.id === meditation?.config.mood);
  const mp = MOOD_PALETTES[meditation?.config.mood ?? 'calm']?.[palette.name] ?? MOOD_PALETTES.calm[palette.name];

  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [done, setDone] = useState(false);
  const lineFade = useRef(new Animated.Value(0)).current;

  const demo = !hasElevenLabsKey() && !meditation?.audioUri;
  const durationSec = meditation?.durationSec ?? 300;

  useEffect(() => {
    if (!playing || done) return;
    const iv = setInterval(() => {
      setElapsed((e) => {
        const nx = e + speed;
        if (nx >= durationSec) {
          setDone(true);
          setPlaying(false);
          return durationSec;
        }
        return nx;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [playing, speed, durationSec, done]);

  const currentLine = useMemo(() => {
    if (!meditation) return null;
    const passed = meditation.lines.filter((l) => l.at <= elapsed);
    return passed.length ? passed[passed.length - 1] : null;
  }, [meditation, elapsed]);

  useEffect(() => {
    lineFade.setValue(0);
    Animated.timing(lineFade, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, [currentLine?.at, lineFade]);

  const heights = useMemo(() => seededHeights(42), []);

  if (!meditation || !mood) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: palette.text, fontFamily: FONTS.sans }}>…</Text>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const progress = elapsed / durationSec;
  const skip = (d: number) => setElapsed((e) => Math.min(Math.max(0, e + d), durationSec));

  const ControlTile = ({ children, onPress, wide }: { children: React.ReactNode; onPress: () => void; wide?: boolean }) => (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flex: wide ? 1.4 : 1, opacity: pressed ? 0.8 : 1 }]}>
      <BlurView
        intensity={26}
        tint={palette.name === 'dark' ? 'dark' : 'light'}
        style={[styles.tile, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
      >
        {children}
      </BlurView>
    </Pressable>
  );

  if (done) {
    return (
      <GradientBackground colors={mp.bg}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.doneCenter}>
            <RingFlower size={300} color={palette.line}>
              <Sparkle size={34} color={palette.text} twinkle />
            </RingFlower>
            <Text style={[styles.doneTitle, { color: palette.text }]}>{t('player_done_title')}</Text>
            <Text style={{ fontFamily: FONTS.sans, fontSize: 15, color: palette.textSoft, textAlign: 'center' }}>
              {t('player_done_body')}
            </Text>
            <Pressable onPress={() => toggleDownload(meditation.id)} style={styles.downloadRow} hitSlop={8}>
              {meditation.downloaded ? (
                <Check color={palette.accent} size={18} />
              ) : (
                <Download color={palette.textSoft} size={18} />
              )}
              <Text style={{ fontFamily: FONTS.sans, fontSize: 14, color: palette.textSoft }}>
                {meditation.downloaded ? t('player_downloaded') : t('player_download')}
              </Text>
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 28, paddingBottom: 30 }}>
            <PrimaryButton label={t('player_finish')} onPress={() => router.dismissTo('/(tabs)')} />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground colors={mp.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <BackButton />
          <Sparkle size={18} color={palette.text} twinkle />
          <Pressable onPress={() => toggleDownload(meditation.id)} hitSlop={10}>
            <BlurView
              intensity={24}
              tint={palette.name === 'dark' ? 'dark' : 'light'}
              style={[styles.iconBtn, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
            >
              {meditation.downloaded ? (
                <Check color={palette.accent} size={19} />
              ) : (
                <Download color={palette.text} size={19} />
              )}
            </BlurView>
          </Pressable>
        </View>

        <View style={styles.figureZone}>
          <AuroraFigure pose={meditation.config.mood === 'sadness' ? 'bowed' : 'gazing'} colors={mp.figure} width={300} height={300} />
        </View>

        <BlurView
          intensity={30}
          tint={palette.name === 'dark' ? 'dark' : 'light'}
          style={[styles.sheet, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
        >
          <View style={[styles.handle, { backgroundColor: palette.textFaint }]} />
          <MicroLabel>{t('mood_label')}</MicroLabel>
          <Text style={[styles.sheetTitle, { color: palette.text }]}>{meditation.title}</Text>

          <View style={{ alignItems: 'center', marginTop: 4 }}>
            <RingFlower size={176} color={palette.line} rotate={playing}>
              <View style={{ alignItems: 'center', gap: 2 }}>
                <Text style={[styles.moodWord, { color: palette.text }]}>{mood.feeling[language]}</Text>
                <Text style={{ fontFamily: FONTS.sans, fontSize: 12, color: palette.textFaint }}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <Sparkle size={13} color={palette.text} style={{ position: 'absolute', top: 28, left: 30 }} twinkle />
            </RingFlower>
          </View>

          <Animated.Text
            numberOfLines={2}
            style={[styles.line, { color: palette.textSoft, opacity: lineFade }]}
          >
            {currentLine ? currentLine.text : '…'}
          </Animated.Text>

          <View style={styles.waveRow}>
            <Text style={[styles.time, { color: palette.textSoft }]}>{fmt(elapsed)}</Text>
            <View style={styles.wave}>
              {heights.map((h, i) => {
                const lit = i / heights.length <= progress;
                return (
                  <View
                    key={i}
                    style={{
                      width: 2,
                      height: h,
                      borderRadius: 1,
                      backgroundColor: lit ? palette.line : palette.textFaint,
                      opacity: lit ? 0.95 : 0.45,
                    }}
                  />
                );
              })}
            </View>
            <Text style={[styles.time, { color: palette.textSoft }]}>{fmt(durationSec)}</Text>
          </View>

          <View style={styles.controls}>
            <ControlTile onPress={() => setPlaying(!playing)} wide>
              {playing ? <Pause color={palette.text} size={24} /> : <Play color={palette.text} size={24} />}
            </ControlTile>
            <ControlTile onPress={() => skip(-15)}>
              <SkipBack color={palette.text} size={22} />
            </ControlTile>
            <ControlTile onPress={() => skip(15)}>
              <SkipFwd color={palette.text} size={22} />
            </ControlTile>
          </View>

          {demo && (
            <Pressable onPress={() => setSpeed(speed === 1 ? 8 : 1)} style={{ alignItems: 'center', marginTop: 12 }} hitSlop={8}>
              <Text style={{ fontFamily: FONTS.sans, fontSize: 11.5, color: palette.textFaint, letterSpacing: 1 }}>
                {t('demo_badge')} · x{speed}
              </Text>
            </Pressable>
          )}
        </BlurView>
      </SafeAreaView>
    </GradientBackground>
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
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  figureZone: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -20 },
  sheet: {
    borderTopLeftRadius: RADII.card + 6,
    borderTopRightRadius: RADII.card + 6,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    marginTop: -40,
  },
  handle: { width: 36, height: 3, borderRadius: 2, alignSelf: 'center', opacity: 0.5, marginBottom: 12 },
  sheetTitle: { fontFamily: FONTS.sans, fontSize: 19, textAlign: 'center', marginTop: 8 },
  moodWord: { fontFamily: FONTS.serif, fontSize: 30, letterSpacing: 0.5 },
  line: { fontFamily: FONTS.serifItalic, fontSize: 16, lineHeight: 23, textAlign: 'center', marginTop: 6, minHeight: 46 },
  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  wave: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 26 },
  time: { fontFamily: FONTS.sans, fontSize: 12 },
  controls: { flexDirection: 'row', gap: 10, marginTop: 16 },
  tile: {
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  doneCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 36 },
  doneTitle: { fontFamily: FONTS.serif, fontSize: 36 },
  downloadRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
});
