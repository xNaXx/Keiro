import React, { useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GradientBackground } from '../../src/components/GradientBackground';
import { MoodIcon } from '../../src/components/MoodIcon';
import { MoodOrb } from '../../src/components/MoodOrb';
import { BackButton, GlassIconButton, CreateHeaderActions, MicroLabel, PrimaryButton, Tap, Title } from '../../src/components/UI';
import { PathTrail } from '../../src/components/PathTrail';
import { ArrowLeft, Moon, SpeakerWave, Sun, Sunrise, Sunset } from '../../src/components/Icons';
import { useApp } from '../../src/store';
import { FONTS, RADII } from '../../src/theme';
import { DURATIONS, ENERGIES, EnergyId, HZ_OPTIONS, MOMENTS, MOODS, MomentId, SoundType, VOICES, VoiceDensity, currentMoment } from '../../src/data';
import { speakSample } from '../../src/services/demoAudio';

const STEPS = ['mood', 'moment', 'duration', 'voice', 'energy', 'density', 'sound'] as const;

/** Module-level so React never remounts it when the selection re-renders. */
function Chip({
  selected,
  onPress,
  children,
  grow,
  palette,
  dark,
}: {
  selected: boolean;
  onPress: () => void;
  children: React.ReactNode;
  grow?: boolean;
  palette: any;
  dark: boolean;
}) {
  const sel = React.useRef(new Animated.Value(selected ? 1 : 0)).current;
  React.useEffect(() => {
    Animated.timing(sel, { toValue: selected ? 1 : 0, duration: 380, useNativeDriver: true }).start();
  }, [selected, sel]);

  return (
    <Tap onPress={onPress} style={grow ? { flexGrow: 1 } : undefined} scaleTo={0.97}>
      <BlurView
        intensity={24}
        tint={dark ? 'dark' : 'light'}
        style={[styles.chip, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
      >
        {/* the selection breathes in and out instead of snapping */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: sel,
              backgroundColor: palette.selectedBg,
              borderRadius: RADII.button,
              borderWidth: 1.4,
              borderColor: palette.selectedBorder,
            },
          ]}
        />
        {children}
      </BlurView>
    </Tap>
  );
}

export default function AdvancedScreen() {
  const { t, palette, language, preferredVoice, plan, showUpgrade } = useApp();
  const router = useRouter();
  const dark = palette.name === 'dark';

  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<string>('calm');
  const [moment, setMoment] = useState<MomentId>(currentMoment());
  const [duration, setDuration] = useState(5);
  const [voice, setVoice] = useState(preferredVoice);
  const [energy, setEnergy] = useState<EnergyId>('serene');
  const [density, setDensity] = useState<VoiceDensity>('medium');
  const [soundType, setSoundType] = useState<SoundType>('ambient');
  const [hzFreq, setHzFreq] = useState(528);

  const titleKeys = ['adv_mood_title', 'adv_moment_title', 'adv_duration_title', 'adv_voice_title', 'adv_energy_title', 'adv_density_title', 'adv_sound_title'];
  const canContinue = true;

  const next = () => {
    if (step < STEPS.length - 1) return setStep(step + 1);
    router.push({
      pathname: plan === 'free' ? '/create/ad' : '/create/generating',
      params: {
        mood,
        moment,
        duration: String(duration),
        voice,
        energy,
        density,
        sound: soundType,
        hz: soundType === 'hz' ? String(hzFreq) : undefined,
        mode: 'advanced',
      },
    });
  };

  const momentIcons = { sunrise: Sunrise, sun: Sun, sunset: Sunset, moon: Moon };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.fill}>
        <View style={styles.header}>
          {step === 0 ? (
            <BackButton />
          ) : (
            <GlassIconButton onPress={() => setStep(step - 1)}>
              <ArrowLeft color={palette.text} size={20} />
            </GlassIconButton>
          )}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <MicroLabel>{t(`${['mood_label', 'moment_label', 'time_label', 'voice_label', 'energy_label', 'density_label', 'sound_label'][step]}`)}</MicroLabel>
            <Text style={{ fontFamily: FONTS.sans, fontSize: 12, color: palette.textFaint }}>
              {t('adv_step', { a: step + 1, b: STEPS.length })}
            </Text>
          </View>
          <CreateHeaderActions />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Title>{t(titleKeys[step])}</Title>
          <View style={{ height: 30 }} />

          {step === 0 && (
            <View style={styles.wrapRow}>
              {MOODS.map((m) => (
                <Chip key={m.id} selected={mood === m.id} onPress={() => setMood(m.id)} palette={palette} dark={dark}>
                  <MoodIcon mood={m.id} size={20} color={palette.text} strokeWidth={1.4} />
                  <Text style={[styles.chipText, { color: palette.text }]}>{m.label[language]}</Text>
                </Chip>
              ))}
            </View>
          )}

          {step === 1 && (
            <View style={styles.wrapRow}>
              {MOMENTS.map((m) => {
                const Icon = momentIcons[m.icon];
                return (
                  <Chip key={m.id} selected={moment === m.id} onPress={() => setMoment(m.id)} grow palette={palette} dark={dark}>
                    <Icon color={palette.text} size={18} />
                    <Text style={[styles.chipText, { color: palette.text }]}>{t(m.tKey)}</Text>
                  </Chip>
                );
              })}
            </View>
          )}

          {step === 2 && (
            <View style={styles.wrapRow}>
              {DURATIONS.map((d) => (
                <Chip key={d} selected={duration === d} onPress={() => setDuration(d)} palette={palette} dark={dark}>
                  <Text style={{ fontFamily: FONTS.serif, fontSize: 24, color: palette.text }}>{d}</Text>
                  <Text style={[styles.chipText, { color: palette.textFaint }]}>{t('minutes')}</Text>
                </Chip>
              ))}
            </View>
          )}

          {step === 3 && (
            <View style={{ gap: 14 }}>
              {VOICES.map((v) => {
                const locked = !!v.premium && plan === 'free';
                return (
                <Tap key={v.id} onPress={() => (locked ? showUpgrade() : setVoice(v.id))} scaleTo={0.97}>
                  <BlurView
                    intensity={24}
                    tint={dark ? 'dark' : 'light'}
                    style={[
                      styles.voiceCard,
                      {
                        backgroundColor: voice === v.id ? palette.selectedBg : palette.glass,
                        borderColor: voice === v.id ? palette.selectedBorder : palette.glassBorder,
                        opacity: locked ? 0.45 : 1,
                      },
                    ]}
                  >
                    <MoodOrb size={52} color={v.tint} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONTS.serif, fontSize: 22, color: palette.text }}>
                        {v.name[language]}
                      </Text>
                      <Text style={{ fontFamily: FONTS.sans, fontSize: 13, color: palette.textFaint, marginTop: 2 }}>
                        {v.desc[language]} · {v.gender === 'female' ? (language === 'es' ? 'femenina' : 'female') : language === 'es' ? 'masculina' : 'male'}
                      </Text>
                    </View>
                    {locked ? (
                      <Text style={{ fontFamily: FONTS.sans, fontSize: 10.5, color: palette.textFaint }}>
                        {t('pw_label')}
                      </Text>
                    ) : (
                      <Tap
                        onPress={() => {
                          setVoice(v.id);
                          speakSample(language, v.gender);
                        }}
                        hitSlop={10}
                        scaleTo={0.85}
                      >
                        <View style={{ alignItems: 'center', gap: 4 }}>
                          <SpeakerWave color={palette.textFaint} size={18} />
                          <Text style={{ fontFamily: FONTS.sans, fontSize: 10.5, color: palette.textFaint }}>
                            {t('preview_voice')}
                          </Text>
                        </View>
                      </Tap>
                    )}
                  </BlurView>
                </Tap>
                );
              })}
            </View>
          )}

          {step === 4 && (
            <View style={{ gap: 14 }}>
              {ENERGIES.map((e) => (
                <Chip key={e.id} selected={energy === e.id} onPress={() => setEnergy(e.id)} grow palette={palette} dark={dark}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 16, color: palette.text }}>{t(e.tKey)}</Text>
                    <Text style={{ fontFamily: FONTS.sans, fontSize: 13, color: palette.textFaint, marginTop: 2 }}>
                      {t(e.dKey)}
                    </Text>
                  </View>
                </Chip>
              ))}
            </View>
          )}

          {step === 5 && (
            <View style={{ gap: 14 }}>
              {(['low', 'medium', 'high'] as VoiceDensity[]).map((d) => (
                <Chip key={d} selected={density === d} onPress={() => setDensity(d)} grow palette={palette} dark={dark}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 16, color: palette.text }}>
                      {t(`density_${d}`)}
                    </Text>
                    <Text style={{ fontFamily: FONTS.sans, fontSize: 13, color: palette.textFaint, marginTop: 2 }}>
                      {t(`density_${d}_d`)}
                    </Text>
                  </View>
                </Chip>
              ))}
            </View>
          )}

          {step === 6 && (
            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {(['ambient', 'hz'] as SoundType[]).map((st) => (
                  <View key={st} style={{ flex: 1, minWidth: 0 }}>
                  <Chip selected={soundType === st} onPress={() => setSoundType(st)} grow palette={palette} dark={dark}>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 15.5, color: palette.text }}>
                        {t(st === 'ambient' ? 'sound_ambient' : 'sound_hz')}
                      </Text>
                      <Text style={{ fontFamily: FONTS.sans, fontSize: 12.5, color: palette.textFaint, marginTop: 2, textAlign: 'center' }}>
                        {t(st === 'ambient' ? 'sound_ambient_d' : 'sound_hz_d')}
                      </Text>
                    </View>
                  </Chip>
                  </View>
                ))}
              </View>

              {soundType === 'hz' && (
                <View style={{ gap: 10, marginTop: 6 }}>
                  {HZ_OPTIONS.map((h) => (
                    <Chip key={h.freq} selected={hzFreq === h.freq} onPress={() => setHzFreq(h.freq)} grow palette={palette} dark={dark}>
                      <View style={[styles.hzBadge, { borderColor: h.tint }]}>
                        <Text style={{ fontFamily: FONTS.serif, fontSize: 15, color: palette.text }}>{h.freq}</Text>
                        <Text style={{ fontFamily: FONTS.sans, fontSize: 9, color: palette.textFaint }}>Hz</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 15, color: palette.text }}>
                          {h.name[language]}
                        </Text>
                        <Text style={{ fontFamily: FONTS.sans, fontSize: 12.5, color: palette.textFaint, marginTop: 1 }}>
                          {h.desc[language]}
                        </Text>
                      </View>
                    </Chip>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <PathTrail
            width={170}
            height={40}
            progress={step / (STEPS.length - 1)}
            color={palette.line}
            faint={palette.textFaint}
          />
          <PrimaryButton
            label={step === STEPS.length - 1 ? t('begin') : t('continue')}
            onPress={canContinue ? next : undefined}
            style={{ alignSelf: 'stretch', opacity: canContinue ? 1 : 0.4 }}
          />
        </View>
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
  scroll: { paddingHorizontal: 26, paddingTop: 26, paddingBottom: 20 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: RADII.button,
    borderWidth: 1.4,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  chipText: { fontFamily: FONTS.sansMedium, fontSize: 14.5 },
  dot: { width: 14, height: 14, borderRadius: 7, opacity: 0.9 },
  hzBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: RADII.card,
    borderWidth: 1.4,
    overflow: 'hidden',
  },
  footer: { alignItems: 'center', gap: 12, paddingHorizontal: 28, paddingBottom: 24 },
});
