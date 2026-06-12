import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GradientBackground } from '../src/components/GradientBackground';
import { BackButton, Body, GlassCard, MicroLabel, Title } from '../src/components/UI';
import { Globe, Moon, Sun } from '../src/components/Icons';
import { Sparkle } from '../src/components/Sparkle';
import { useApp } from '../src/store';
import { FONTS } from '../src/theme';
import { VOICES } from '../src/data';
import { hasElevenLabsKey } from '../src/services/elevenlabs';
import { hasClaudeKey } from '../src/services/claude';

export default function SettingsScreen() {
  const { t, palette, themeMode, setThemeMode, language, setLanguage, preferredVoice, setPreferredVoice } = useApp();
  const dark = palette.name === 'dark';

  const Segment = ({
    options,
    value,
    onChange,
  }: {
    options: { id: string; label: string; icon?: React.ReactNode }[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <View style={[styles.segment, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}>
      {options.map((o) => {
        const sel = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={[styles.segmentBtn, sel && { backgroundColor: palette.glassStrong, borderRadius: 20 }]}
          >
            {o.icon}
            <Text
              style={{
                fontFamily: sel ? FONTS.sansMedium : FONTS.sans,
                fontSize: 13.5,
                color: sel ? palette.text : palette.textFaint,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <BackButton />
          <MicroLabel>{t('settings_title').toLowerCase()}</MicroLabel>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Title>{t('settings_title')}</Title>

          <View style={{ gap: 26, marginTop: 32 }}>
            <View style={{ gap: 12 }}>
              <Text style={[styles.section, { color: palette.textSoft }]}>{t('settings_appearance')}</Text>
              <Segment
                value={themeMode}
                onChange={(v) => setThemeMode(v as any)}
                options={[
                  { id: 'light', label: t('theme_light'), icon: <Sun color={themeMode === 'light' ? palette.text : palette.textFaint} size={15} /> },
                  { id: 'dark', label: t('theme_dark'), icon: <Moon color={themeMode === 'dark' ? palette.text : palette.textFaint} size={15} /> },
                  { id: 'system', label: t('theme_system') },
                ]}
              />
            </View>

            <View style={{ gap: 12 }}>
              <Text style={[styles.section, { color: palette.textSoft }]}>{t('settings_language')}</Text>
              <Segment
                value={language}
                onChange={(v) => setLanguage(v as any)}
                options={[
                  { id: 'es', label: 'Español', icon: <Globe color={language === 'es' ? palette.text : palette.textFaint} size={15} /> },
                  { id: 'en', label: 'English', icon: <Globe color={language === 'en' ? palette.text : palette.textFaint} size={15} /> },
                ]}
              />
              <Body faint center={false}>{t('settings_lang_hint')}</Body>
            </View>

            <View style={{ gap: 12 }}>
              <Text style={[styles.section, { color: palette.textSoft }]}>{t('settings_voice')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {VOICES.map((v) => {
                  const sel = preferredVoice === v.id;
                  return (
                    <Pressable key={v.id} onPress={() => setPreferredVoice(v.id)}>
                      <BlurView
                        intensity={22}
                        tint={dark ? 'dark' : 'light'}
                        style={[
                          styles.voiceChip,
                          {
                            backgroundColor: sel ? palette.glassStrong : palette.glass,
                            borderColor: sel ? palette.line : palette.glassBorder,
                            borderWidth: sel ? 1 : StyleSheet.hairlineWidth,
                          },
                        ]}
                      >
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: v.tint }} />
                        <Text style={{ fontFamily: sel ? FONTS.sansMedium : FONTS.sans, fontSize: 13.5, color: palette.text }}>
                          {v.name[language]}
                        </Text>
                      </BlurView>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <GlassCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Sparkle size={14} color={palette.text} />
                <Text style={{ fontFamily: FONTS.serif, fontSize: 21, color: palette.text }}>
                  {t('settings_about')}
                </Text>
              </View>
              <Body center={false}>{t('settings_about_body')}</Body>
              {!hasElevenLabsKey() && !hasClaudeKey() && (
                <View style={{ marginTop: 14 }}>
                  <Body center={false} faint>{t('demo_hint')}</Body>
                </View>
              )}
            </GlassCard>
          </View>
        </ScrollView>
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
  },
  scroll: { paddingHorizontal: 26, paddingTop: 24, paddingBottom: 50 },
  section: { fontFamily: FONTS.sansMedium, fontSize: 14 },
  segment: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  voiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
