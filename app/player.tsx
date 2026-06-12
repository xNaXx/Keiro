import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, GestureResponderEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GradientBackground } from '../src/components/GradientBackground';
import { FigureBackdrop, FigureName } from '../src/components/FigureArt';
import { RingFlower } from '../src/components/RingFlower';
import { Sparkle } from '../src/components/Sparkle';
import { BackButton, MicroLabel, PrimaryButton, SettingsButton, Tap, ThemeToggle } from '../src/components/UI';
import { Check, Download, Pause, Play, SkipBack, SkipFwd } from '../src/components/Icons';
import { useApp } from '../src/store';
import { FONTS, MOOD_PALETTES, RADII } from '../src/theme';
import { MOODS, VOICES } from '../src/data';
import { hasElevenLabsKey } from '../src/services/elevenlabs';
import { fadeOutAmbient, renderAmbientWav, speakLine, startAmbient, stopAmbient, stopSpeech } from '../src/services/demoAudio';
import { Brand } from '../src/components/KeiroLogo';

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Module-level so a re-render never remounts it mid-animation. */
function ControlTile({
  children,
  onPress,
  wide,
  palette,
}: {
  children: React.ReactNode;
  onPress: () => void;
  wide?: boolean;
  palette: any;
}) {
  return (
    <Tap onPress={onPress} style={{ flex: wide ? 1.4 : 1 }} scaleTo={0.93}>
      <BlurView
        intensity={26}
        tint={palette.name === 'dark' ? 'dark' : 'light'}
        style={[styles.tile, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
      >
        {children}
      </BlurView>
    </Tap>
  );
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

  const meditation = sessions.find((s) => s.id === id);
  const mood = MOODS.find((m) => m.id === meditation?.config.mood);
  const voice = VOICES.find((v) => v.id === meditation?.config.voiceId) ?? VOICES[0];
  const mp = MOOD_PALETTES[meditation?.config.mood ?? 'calm']?.[palette.name] ?? MOOD_PALETTES.calm[palette.name];

  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [done, setDone] = useState(false);
  const lineFade = useRef(new Animated.Value(0)).current;
  const waveWidth = useRef(1);

  const demo = !hasElevenLabsKey() && !meditation?.audioUri;
  const dark = palette.name === 'dark';
  // tall artworks crop gracefully into the phone frame
  const figure: FigureName = dark ? 'profile-violet' : 'warm';
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

  // demo soundscape: ambient pad while playing, browser voice per line
  useEffect(() => {
    if (demo && playing && !done) startAmbient();
    else {
      stopAmbient();
      stopSpeech();
    }
    return () => {
      stopAmbient();
      stopSpeech();
    };
  }, [demo, playing, done]);

  // the session never ends abruptly: the pad dissolves over the last seconds
  const remaining = durationSec - elapsed;
  useEffect(() => {
    if (demo && playing && !done && remaining <= 9 && remaining > 0) fadeOutAmbient(remaining);
  }, [demo, playing, done, remaining]);

  const currentLine = useMemo(() => {
    if (!meditation) return null;
    const passed = meditation.lines.filter((l) => l.at <= elapsed);
    return passed.length ? passed[passed.length - 1] : null;
  }, [meditation, elapsed]);

  useEffect(() => {
    lineFade.setValue(0);
    Animated.timing(lineFade, { toValue: 1, duration: 900, useNativeDriver: true }).start();
    if (demo && playing && currentLine && !done) {
      speakLine(currentLine.text, language, voice.gender);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLine?.at]);

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

  const seekFromEvent = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.locationX;
    const p = Math.min(1, Math.max(0, x / waveWidth.current));
    stopSpeech();
    setElapsed(Math.round(p * durationSec));
    if (done && p < 1) setDone(false);
  };

  const downloadFile = async () => {
    toggleDownload(meditation.id);
    if (Platform.OS !== 'web' || meditation.downloaded) return;
    try {
      let blob: Blob | null;
      let name: string;
      if (meditation.audioUri) {
        blob = await (await fetch(meditation.audioUri)).blob();
        name = `Keiro — ${meditation.title}.mp3`;
      } else {
        blob = await renderAmbientWav(meditation.durationSec);
        name = `Keiro — ${meditation.title} (ambiente demo).wav`;
      }
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch {}
  };

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
            <Tap onPress={downloadFile} style={styles.downloadRow} hitSlop={8}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {meditation.downloaded ? (
                  <Check color={palette.accent} size={18} />
                ) : (
                  <Download color={palette.textSoft} size={18} />
                )}
                <Text style={{ fontFamily: FONTS.sans, fontSize: 14, color: palette.textSoft }}>
                  {meditation.downloaded ? t('player_downloaded') : t('player_download')}
                </Text>
              </View>
            </Tap>
          </View>
          <View style={{ paddingHorizontal: 28, paddingBottom: 30 }}>
            <PrimaryButton label={t('player_finish')} onPress={() => router.dismissTo('/home')} />
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
          <Brand color={palette.text} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <ThemeToggle />
            <SettingsButton />
            <Tap onPress={downloadFile} hitSlop={6} scaleTo={0.88}>
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
            </Tap>
          </View>
        </View>

        <View style={styles.figureZone}>
          <FigureBackdrop name={figure} fadeTo={mp.bg[2]} />
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
            <View
              style={styles.waveTouch}
              onLayout={(e) => (waveWidth.current = e.nativeEvent.layout.width)}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={seekFromEvent}
              onResponderMove={seekFromEvent}
            >
              <View style={styles.wave} pointerEvents="none">
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
            </View>
            <Text style={[styles.time, { color: palette.textSoft }]}>{fmt(durationSec)}</Text>
          </View>

          <View style={styles.controls}>
            <ControlTile onPress={() => setPlaying(!playing)} wide palette={palette}>
              {playing ? <Pause color={palette.text} size={24} /> : <Play color={palette.text} size={24} />}
            </ControlTile>
            <ControlTile onPress={() => skip(-15)} palette={palette}>
              <SkipBack color={palette.text} size={24} />
            </ControlTile>
            <ControlTile onPress={() => skip(15)} palette={palette}>
              <SkipFwd color={palette.text} size={24} />
            </ControlTile>
          </View>

          {demo && (
            <Tap onPress={() => setSpeed(speed === 1 ? 8 : 1)} style={{ alignItems: 'center', marginTop: 12 }} hitSlop={8}>
              <Text style={{ fontFamily: FONTS.sans, fontSize: 11.5, color: palette.textFaint, letterSpacing: 1 }}>
                {t('demo_badge')} · x{speed} · {t('demo_voice')}
              </Text>
            </Tap>
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
  figureZone: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    marginTop: 'auto',
    borderTopLeftRadius: RADII.card + 6,
    borderTopRightRadius: RADII.card + 6,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
  },
  handle: { width: 36, height: 3, borderRadius: 2, alignSelf: 'center', opacity: 0.5, marginBottom: 12 },
  sheetTitle: { fontFamily: FONTS.sans, fontSize: 19, textAlign: 'center', marginTop: 8 },
  moodWord: { fontFamily: FONTS.serif, fontSize: 30, letterSpacing: 0.5 },
  line: { fontFamily: FONTS.serifItalic, fontSize: 16, lineHeight: 23, textAlign: 'center', marginTop: 6, minHeight: 46 },
  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  waveTouch: { flex: 1, paddingVertical: 8, justifyContent: 'center', cursor: 'pointer' } as any,
  wave: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 26 },
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
  downloadRow: { marginTop: 16 },
});
