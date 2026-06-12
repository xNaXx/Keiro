import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { MoodIcon } from '../../src/components/MoodIcon';
import { Body, GlassCard, HeaderActions, MicroLabel, Tap, Title } from '../../src/components/UI';
import { Check, Download } from '../../src/components/Icons';
import { Sparkle } from '../../src/components/Sparkle';
import { Brand } from '../../src/components/KeiroLogo';
import { useApp } from '../../src/store';
import { FONTS } from '../../src/theme';
import { MOODS, Meditation } from '../../src/data';

export default function LibraryScreen() {
  const { t, palette, sessions, toggleDownload, language } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<'offline' | 'history'>('offline');

  const list = tab === 'offline' ? sessions.filter((s) => s.downloaded) : sessions;

  const Item = ({ m }: { m: Meditation }) => {
    const mood = MOODS.find((x) => x.id === m.config.mood);
    return (
      <GlassCard onPress={() => router.push({ pathname: '/player', params: { id: m.id } })} style={{ marginBottom: 14 }}>
        <View style={styles.itemRow}>
          <View style={[styles.orb, { borderColor: palette.line }]}>
            <MoodIcon mood={m.config.mood} size={22} color={palette.text} strokeWidth={1.4} />
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
          <Tap onPress={() => toggleDownload(m.id)} hitSlop={10} scaleTo={0.85}>
            {m.downloaded ? (
              <Check color={palette.accent} size={20} />
            ) : (
              <Download color={palette.textFaint} size={20} />
            )}
          </Tap>
        </View>
      </GlassCard>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <View style={{ width: 98 }} />
            <Brand color={palette.text} />
            <HeaderActions />
          </View>
          <View style={{ alignItems: 'center', marginBottom: 22 }}>
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginBottom: 18 },
  tabs: {
    flexDirection: 'row',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
    marginBottom: 22,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  orb: { width: 46, height: 46, borderRadius: 23, borderWidth: 0.8, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontFamily: FONTS.sansMedium, fontSize: 15.5 },
  hint: { fontFamily: FONTS.sans, fontSize: 12.5, lineHeight: 19, textAlign: 'center', marginTop: 18, paddingHorizontal: 16 },
});
