import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, GestureResponderEvent, PanResponder, Platform, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GradientBackground } from '../src/components/GradientBackground';
import { FigureBackdrop, FigureName } from '../src/components/FigureArt';
import { RingFlower } from '../src/components/RingFlower';
import { Sparkle } from '../src/components/Sparkle';
import { BackButton, MicroLabel, PrimaryButton, SettingsButton, Tap, ThemeToggle } from '../src/components/UI';
import { Check, Download, MusicNote, Pause, Play, SkipBack, SkipFwd, VoiceWave } from '../src/components/Icons';
import { useApp } from '../src/store';
import { FONTS, MOOD_PALETTES, RADII } from '../src/theme';
import { HZ_OPTIONS, MOODS, VOICES } from '../src/data';
import { findPrebuilt } from '../src/prebuilt';
import { SOUNDS } from '../src/sounds';
import { hasElevenLabsKey } from '../src/services/elevenlabs';
import { getVolumes, onSpeaking, renderAmbientWav, setVoiceVolume, speakLine, stopSpeech } from '../src/services/demoAudio';
import { fadeOutSoundscape, getMix, setHz, setLayer, setSoundscapeVolume, startSoundscape, stopSoundscape } from '../src/services/soundscape';
import { VoiceOrb } from '../src/components/VoiceOrb';
import { Brand } from '../src/components/KeiroLogo';

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Hairline volume slider: a white line with a small thumb. */
function VolumeSlider({
  icon,
  value,
  onChange,
  palette,
}: {
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  palette: any;
}) {
  const w = useRef(1);
  const set = (e: GestureResponderEvent) => {
    const v = Math.min(1, Math.max(0, e.nativeEvent.locationX / w.current));
    onChange(v);
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {icon}
      <View
        style={{ flex: 1, height: 26, justifyContent: 'center' }}
        onLayout={(e) => (w.current = e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={set}
        onResponderMove={set}
      >
        <View style={{ height: 1.5, borderRadius: 1, backgroundColor: palette.textFaint, opacity: 0.7 }} />
        <View
          style={{
            position: 'absolute',
            left: 0,
            width: `${value * 100}%`,
            height: 1.5,
            borderRadius: 1,
            backgroundColor: palette.line,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: `${value * 100}%`,
            marginLeft: -6,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: palette.line,
          }}
        />
      </View>
    </View>
  );
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
  const { t, palette, sessions, toggleDownload, language, plan, showUpgrade } = useApp();
  const router = useRouter();

  const meditation = sessions.find((s) => s.id === id) ?? findPrebuilt(id ?? '', language);
  const mood = MOODS.find((m) => m.id === meditation?.config.mood);
  const voice = VOICES.find((v) => v.id === meditation?.config.voiceId) ?? VOICES[0];
  const mp = MOOD_PALETTES[meditation?.config.mood ?? 'calm']?.[palette.name] ?? MOOD_PALETTES.calm[palette.name];

  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const sheetShift = useRef(new Animated.Value(0)).current;
  const sheetH = useRef(0);
  const [done, setDone] = useState(false);
  const [vols, setVols] = useState(getVolumes());
  const [mix, setMix] = useState(getMix());
  const [mixOpen, setMixOpen] = useState(false);
  const lineFade = useRef(new Animated.Value(0)).current;
  const waveWidth = useRef(1);

  // Real ElevenLabs audio element (web only)
  const htmlAudio = useRef<HTMLAudioElement | null>(null);
  const [audioActive, setAudioActive] = useState(false);

  const hasRealAudio = !!(meditation?.audioUri && Platform.OS === 'web');
  const demo = !hasRealAudio;
  const dark = palette.name === 'dark';
  // tall artworks crop gracefully into the phone frame
  const figure: FigureName = dark ? 'profile-violet' : 'warm';
  const durationSec = meditation?.durationSec ?? 300;

  // Session timer — always a fake interval (real audio plays alongside it)
  useEffect(() => {
    if (!playing || done) return;
    const iv = setInterval(() => {
      setElapsed((e) => {
        const nx = e + 1;
        if (nx >= durationSec) {
          setDone(true);
          setPlaying(false);
          return durationSec;
        }
        return nx;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [playing, durationSec, done]);

  // Real ElevenLabs audio: initialize once per audioUri
  useEffect(() => {
    if (!hasRealAudio || Platform.OS !== 'web') return;
    const audio = new (window as any).Audio(meditation!.audioUri) as HTMLAudioElement;
    audio.volume = vols.voice;
    audio.onplay = () => setAudioActive(true);
    audio.onpause = () => setAudioActive(false);
    audio.onended = () => { setAudioActive(false); fadeOutSoundscape(3); };
    htmlAudio.current = audio;
    if (playing) audio.play().catch(() => {});
    return () => { audio.pause(); audio.src = ''; htmlAudio.current = null; };
    // intentionally no vols/playing in deps — we sync those in separate effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meditation?.audioUri]);

  // Sync play/pause with real audio
  useEffect(() => {
    if (!htmlAudio.current) return;
    if (playing && !done) htmlAudio.current.play().catch(() => {});
    else htmlAudio.current.pause();
  }, [playing, done]);

  // Demo voice activity drives the orb
  useEffect(() => onSpeaking(setSpeaking), []);

  const setSheet = (c: boolean) => {
    setCollapsed(c);
    Animated.spring(sheetShift, {
      toValue: c ? 1 : 0,
      useNativeDriver: true,
      speed: 9,
      bounciness: 2,
    }).start();
  };

  const sheetPan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 16 && Math.abs(g.dy) > Math.abs(g.dx) * 1.4,
      onPanResponderRelease: (_, g) => {
        if (g.dy > 40) setSheet(true);
        else if (g.dy < -40) setSheet(false);
      },
    })
  ).current;

  // Ambient soundscape (mixable layers + Hz) under the voice
  useEffect(() => {
    if (playing && !done) {
      startSoundscape();
    } else {
      stopSoundscape();
      if (demo) stopSpeech();
    }
    return () => { stopSoundscape(); stopSpeech(); };
  }, [playing, done, demo]);

  // Soundscape dissolves over the last few seconds so the session never ends abruptly
  const remaining = durationSec - elapsed;
  useEffect(() => {
    if (playing && !done && remaining <= 9 && remaining > 0) fadeOutSoundscape(remaining);
  }, [playing, done, remaining]);

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

  const seekTo = useCallback((sec: number) => {
    const clamped = Math.min(Math.max(0, sec), durationSec);
    if (htmlAudio.current) htmlAudio.current.currentTime = clamped;
    stopSpeech();
    setElapsed(clamped);
    if (done && clamped < durationSec) setDone(false);
  }, [durationSec, done]);

  const skip = (d: number) => seekTo(elapsed + d);

  const seekFromEvent = (e: GestureResponderEvent) => {
    const x = e.nativeEvent.locationX;
    const p = Math.min(1, Math.max(0, x / waveWidth.current));
    seekTo(Math.round(p * durationSec));
  };

  const downloadFile = async () => {
    if (plan === 'free') {
      showUpgrade();
      return;
    }
    toggleDownload(meditation.id);
    if (Platform.OS !== 'web' || meditation.downloaded) return;
    try {
      let blob: Blob | null;
      let name: string;
      if (meditation.audioUri) {
        blob = await (await fetch(meditation.audioUri)).blob();
        name = `Keiro — ${meditation.title}.mp3`;
      } else {
        blob = await renderAmbientWav(meditation.durationSec, meditation.config.soundType === 'hz' ? meditation.config.hzFreq : undefined);
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
      <View style={{ flex: 1, overflow: 'hidden', backgroundColor: mp.bg[0] }}>
        <FigureBackdrop name="standing" fadeTo={mp.bg[2]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
              <View style={{ width: 98 }} />
              <Brand color="rgba(255,255,255,0.9)" />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <ThemeToggle />
                <SettingsButton />
              </View>
            </View>
            <View style={styles.doneCenter}>
              <RingFlower size={280} color="rgba(255,255,255,0.8)">
                <Sparkle size={34} color="#ffffff" twinkle />
              </RingFlower>
              <Text style={[styles.doneTitle, { color: '#ffffff' }]}>{t('player_done_title')}</Text>
              <Text style={{ fontFamily: FONTS.sans, fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center' }}>
                {t('player_done_body')}
              </Text>
              <Tap onPress={downloadFile} style={styles.downloadRow} hitSlop={8}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {meditation.downloaded ? (
                    <Check color="#ffe9b8" size={18} />
                  ) : (
                    <Download color="rgba(255,255,255,0.85)" size={18} />
                  )}
                  <Text style={{ fontFamily: FONTS.sans, fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
                    {meditation.downloaded ? t('player_downloaded') : t('player_download')}
                  </Text>
                </View>
              </Tap>
            </View>
            <View style={{ paddingHorizontal: 28, paddingBottom: 30 }}>
              <PrimaryButton label={t('player_finish')} onPress={() => router.dismissTo('/home')} />
            </View>
          </SafeAreaView>
        </FigureBackdrop>
      </View>
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
            <View style={plan === 'free' ? { opacity: 0.45 } : undefined}>
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
        </View>

        <View style={styles.figureZone}>
          <FigureBackdrop name={figure} fadeTo={mp.bg[2]} />
        </View>

        <Animated.View
          onLayout={(e) => (sheetH.current = e.nativeEvent.layout.height)}
          style={{
            marginTop: 'auto',
            transform: [
              {
                translateY: sheetShift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 99999].map((v, i) => (i === 0 ? 0 : Math.max(0, (sheetH.current || 420) - 96))),
                }),
              },
            ],
          }}
        >
        <BlurView
          intensity={30}
          tint={palette.name === 'dark' ? 'dark' : 'light'}
          style={[styles.sheet, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
        >
          <View {...sheetPan.panHandlers}>
            <Tap onPress={() => setSheet(!collapsed)} hitSlop={8}>
              <View style={{ paddingVertical: 4 }}>
                <View style={[styles.handle, { backgroundColor: palette.textFaint }]} />
              </View>
            </Tap>
            {collapsed ? (
              <View style={styles.miniRow}>
                <VoiceOrb size={40} color={palette.line} active={demo ? (speaking && playing) : audioActive}>
                  <Text style={{ fontFamily: FONTS.sans, fontSize: 10, color: palette.text }}>
                    {Math.round(progress * 100)}%
                  </Text>
                </VoiceOrb>
                <Text style={[styles.miniTitle, { color: palette.text }]} numberOfLines={1}>
                  {meditation.title}
                </Text>
                <Tap onPress={() => setPlaying(!playing)} hitSlop={10} scaleTo={0.85}>
                  {playing ? <Pause color={palette.text} size={22} /> : <Play color={palette.text} size={22} />}
                </Tap>
              </View>
            ) : (
              <>
                <MicroLabel>{t('mood_label')}</MicroLabel>
                <Text style={[styles.sheetTitle, { color: palette.text }]}>{meditation.title}</Text>
              </>
            )}
          </View>

          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <VoiceOrb size={176} color={palette.line} active={demo ? (speaking && playing) : audioActive}>
              <View style={{ alignItems: 'center', gap: 2 }}>
                <Text style={[styles.moodWord, { color: palette.text }]}>{mood.feeling[language]}</Text>
                <Text style={{ fontFamily: FONTS.sans, fontSize: 12, color: palette.textFaint }}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              <Sparkle size={13} color={palette.text} style={{ position: 'absolute', top: 24, left: 26 }} twinkle />
            </VoiceOrb>
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

          <View style={{ gap: 10, marginTop: 14, paddingHorizontal: 6 }}>
            <VolumeSlider
              icon={<VoiceWave color={palette.textSoft} size={17} />}
              value={vols.voice}
              onChange={(v) => {
                if (htmlAudio.current) htmlAudio.current.volume = v;
                setVoiceVolume(v);
                setVols({ ...vols, voice: v });
              }}
              palette={palette}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <MusicNote color={palette.textSoft} size={17} />
              <View style={{ flex: 1 }}>
                <VolumeSlider
                  icon={null}
                  value={vols.music}
                  onChange={(v) => {
                    setSoundscapeVolume(v);
                    setVols({ ...vols, music: v });
                  }}
                  palette={palette}
                />
              </View>
              <Tap onPress={() => setMixOpen((o) => !o)} hitSlop={8} scaleTo={0.9}>
                <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 12, color: mixOpen ? palette.text : palette.textFaint }}>
                  {t('mix_label')}
                </Text>
              </Tap>
            </View>
          </View>

          {mixOpen && (
            <View style={[styles.mixer, { borderColor: palette.glassBorder }]}>
              {SOUNDS.map((s) => {
                const lay = mix.layers.find((l) => l.key === s.key);
                const on = lay?.enabled ?? false;
                return (
                  <View key={s.key} style={styles.mixRow}>
                    <Tap
                      onPress={() => {
                        const enabled = !on;
                        setLayer(s.key, enabled, lay?.volume ?? 0.6);
                        setMix(getMix());
                      }}
                      hitSlop={6}
                      scaleTo={0.9}
                    >
                      <View style={[styles.mixDot, { borderColor: s.tint, backgroundColor: on ? s.tint : 'transparent' }]} />
                    </Tap>
                    <Text style={[styles.mixName, { color: on ? palette.text : palette.textFaint }]}>{s.name[language]}</Text>
                    <View style={{ flex: 1, opacity: on ? 1 : 0.4 }}>
                      <VolumeSlider
                        icon={null}
                        value={lay?.volume ?? 0.6}
                        onChange={(v) => {
                          setLayer(s.key, true, v);
                          setMix(getMix());
                        }}
                        palette={palette}
                      />
                    </View>
                  </View>
                );
              })}
              <View style={styles.mixRow}>
                <Tap
                  onPress={() => {
                    const next = mix.hzFreq == null ? meditation.config.hzFreq ?? 528 : null;
                    setHz(next, mix.hzVol);
                    setMix(getMix());
                  }}
                  hitSlop={6}
                  scaleTo={0.9}
                >
                  <View style={[styles.mixDot, { borderColor: palette.accent, backgroundColor: mix.hzFreq != null ? palette.accent : 'transparent' }]} />
                </Tap>
                <Text style={[styles.mixName, { color: mix.hzFreq != null ? palette.text : palette.textFaint }]}>
                  {mix.hzFreq != null ? `${mix.hzFreq} Hz` : 'Hz'}
                </Text>
                <View style={styles.hzChips}>
                  {HZ_OPTIONS.map((h) => (
                    <Tap
                      key={h.freq}
                      onPress={() => {
                        setHz(h.freq, mix.hzVol);
                        setMix(getMix());
                      }}
                      hitSlop={4}
                      scaleTo={0.9}
                    >
                      <Text
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: 11,
                          color: mix.hzFreq === h.freq ? palette.text : palette.textFaint,
                          opacity: mix.hzFreq === h.freq ? 1 : 0.6,
                        }}
                      >
                        {h.freq}
                      </Text>
                    </Tap>
                  ))}
                </View>
              </View>
            </View>
          )}

          <View style={styles.controls}>
            <ControlTile onPress={() => skip(-15)} palette={palette}>
              <SkipBack color={palette.text} size={24} />
            </ControlTile>
            <ControlTile onPress={() => setPlaying(!playing)} wide palette={palette}>
              {playing ? <Pause color={palette.text} size={24} /> : <Play color={palette.text} size={24} />}
            </ControlTile>
            <ControlTile onPress={() => skip(15)} palette={palette}>
              <SkipFwd color={palette.text} size={24} />
            </ControlTile>
          </View>

          {demo && (
            <Text style={{ fontFamily: FONTS.sans, fontSize: 11.5, color: palette.textFaint, letterSpacing: 1, textAlign: 'center', marginTop: 12 }}>
              {t('demo_badge')} · {t('demo_voice')}
            </Text>
          )}
        </BlurView>
        </Animated.View>
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
    borderTopLeftRadius: RADII.card + 6,
    borderTopRightRadius: RADII.card + 6,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
  },
  handle: { width: 36, height: 3, borderRadius: 2, alignSelf: 'center', opacity: 0.5, marginBottom: 8 },
  miniRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 4, paddingBottom: 10 },
  miniTitle: { flex: 1, fontFamily: FONTS.sansMedium, fontSize: 15 },
  sheetTitle: { fontFamily: FONTS.sans, fontSize: 19, textAlign: 'center', marginTop: 8 },
  moodWord: { fontFamily: FONTS.serif, fontSize: 30, letterSpacing: 0.5 },
  line: { fontFamily: FONTS.serifItalic, fontSize: 16, lineHeight: 23, textAlign: 'center', marginTop: 6, minHeight: 46 },
  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  waveTouch: { flex: 1, paddingVertical: 8, justifyContent: 'center', cursor: 'pointer' } as any,
  wave: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 26 },
  time: { fontFamily: FONTS.sans, fontSize: 12 },
  mixer: { marginTop: 12, paddingTop: 12, gap: 10, borderTopWidth: StyleSheet.hairlineWidth },
  mixRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mixDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5 },
  mixName: { fontFamily: FONTS.sans, fontSize: 13, width: 64 },
  hzChips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
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
