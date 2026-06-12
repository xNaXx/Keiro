import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { MoodOrb } from '../../src/components/MoodOrb';
import { Body, GlassCard, MicroLabel, Title } from '../../src/components/UI';
import { Check, Download, Play } from '../../src/components/Icons';
import { Sparkle } from '../../src/components/Sparkle';
import { useApp } from '../../src/store';
import { FONTS, MOOD_PALETTES } from '../../src/theme';
import { MOODS, Meditation } from '../../src/data';

export default function LibraryScreen() {
  const { t, palette, sessions, toggleDownload, language } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<'offline' | 'history'>('offline');

  const list = tab === 'offline' ? sessions.filter((s) => s.downloaded) : sessions;

  const Item = ({ m }: { m: Meditation }) => {
    const mood = MOODS.find((x) => x.id === m.config.mood);
    const mp = MOOD_PALETTES[m.config.mood]?.[palette.name] ?? MOOD_PALETTES.calm[palette.name];
    return (
      <GlassCard onPress={() => router.push({ pathname: '/player', params: { id: m.id } })} style={{ marginBottom: 14 }}>
        <View style={styles.itemRow}>
          <View style={styles.orb}>
            <MoodOrb size={46} color={mp.figure[1]} core={mp.figure[2]} />
            <View style={{ position: 'absolute' }}>
              <Play color="rgba(255,255,255,0.95)" size={15} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemTitle, { color: palette.text }]} numberOfLines={1}>
              {m.title}
            </Text>
            <Text style={{ fontFamily: FONTS.sans, fontSize: 12.5, color: palette.textFaint, marginTop: 3 }}>
              {mood?.label[language]} · {m.config.durationMin} {t('minutes')} ·{' '}
              {new Date(m.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
          <Pressable onPress={() => toggleDownload(m.id)} hitSlop={10}>
            {m.downloaded ? (
              <Check color={palette.accent} size={20} />
            ) : (
              <Download color={palette.textFaint} size={20} />
            )}
          </Pressable>
        </View>
      </GlassCard>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 22 }}>
            <MicroLabel>{t('tab_library').toLowerCase()}</MicroLabel>
            <View style={{ height: 10 }} />
            <Title>{t('lib_title')}</Title>
            <View style={{ height: 6 }} />
            <Body faint>{t('lib_sub')}</Body>
          </View>

          <View style={[styles.tabs, { borderColor: palette.glassBorder, backgroundColor: palette.glass }]}>
            {(['offline', 'history'] as const).map((k) => (
              <Pressable
                key={k}
                onPress={() => setTab(k)}
                style={[
                  styles.tabBtn,
                  tab === k && { backgroundColor: palette.glassStrong, borderRadius: 22 },
                ]}
              >
                <Text
                  style={{
                    fontFamily: tab === k ? FONTS.sansMedium : FONTS.sans,
                    fontSize: 14,
                    color: tab === k ? palette.text : palette.textFaint,
                  }}
                >
                  {k === 'offline' ? t('lib_offline') : t('lib_history')}
                </Text>
              </Pressable>
            ))}
          </View>

          {list.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 60, gap: 16, paddingHorizontal: 30 }}>
              <Sparkle size={18} color={palette.textFaint} twinkle />
              <Body faint>{t('lib_empty')}</Body>
            </View>
          ) : (
            list.map((m) => <Item key={m.id} m={m} />)
          )}

          {tab === 'offline' && (
            <Text style={[styles.hint, { color: palette.textFaint }]}>{t('lib_offline_hint')}</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingBottom: 130 },
  tabs: {
    flexDirection: 'row',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
    marginBottom: 22,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  orb: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontFamily: FONTS.sansMedium, fontSize: 15.5 },
  hint: { fontFamily: FONTS.sans, fontSize: 12.5, lineHeight: 19, textAlign: 'center', marginTop: 18, paddingHorizontal: 16 },
});
