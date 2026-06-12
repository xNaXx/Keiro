import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/GradientBackground';
import { BackButton, Body, GlassCard, HeaderActions, MicroLabel, Title } from '../../src/components/UI';
import { Sparkle } from '../../src/components/Sparkle';
import { Brand } from '../../src/components/KeiroLogo';
import { Gear } from '../../src/components/Icons';
import { useApp } from '../../src/store';
import { FONTS } from '../../src/theme';

export default function ModeScreen() {
  const { t, palette } = useApp();
  const router = useRouter();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.fill}>
        <View style={styles.header}>
          <BackButton />
          <Brand color={palette.text} />
          <HeaderActions />
        </View>

        <View style={styles.center}>
          <Title>{t('mode_title')}</Title>

          <View style={{ gap: 16, alignSelf: 'stretch', marginTop: 36 }}>
            <GlassCard strong onPress={() => router.push('/create/simple')}>
              <View style={styles.cardHead}>
                <Sparkle size={18} color={palette.text} />
                <Text style={[styles.cardTitle, { color: palette.text }]}>{t('mode_simple')}</Text>
              </View>
              <Body center={false}>{t('mode_simple_desc')}</Body>
            </GlassCard>

            <GlassCard onPress={() => router.push('/create/advanced')}>
              <View style={styles.cardHead}>
                <Gear size={18} color={palette.text} />
                <Text style={[styles.cardTitle, { color: palette.text }]}>{t('mode_advanced')}</Text>
              </View>
              <Body center={false}>{t('mode_advanced_desc')}</Body>
            </GlassCard>
          </View>
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
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 60 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardTitle: { fontFamily: FONTS.serif, fontSize: 26 },
});
