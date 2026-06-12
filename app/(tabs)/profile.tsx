import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { GradientBackground } from '../../src/components/GradientBackground';
import { GlassCard, GlassIconButton, MicroLabel, PrimaryButton } from '../../src/components/UI';
import { Camera, Gear, Logout, Pencil } from '../../src/components/Icons';
import { PathTrail } from '../../src/components/PathTrail';
import { useApp } from '../../src/store';
import { FONTS, RADII } from '../../src/theme';

export default function ProfileScreen() {
  const { t, palette, user, updateUser, signOut, pathDay, sessions } = useApp();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');

  const totalMin = Math.round(sessions.reduce((acc, s) => acc + s.durationSec, 0) / 60);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled && res.assets[0]) updateUser({ photoUri: res.assets[0].uri });
  };

  const saveEdits = () => {
    updateUser({ name: name.trim() || user?.name, age: age ? Number(age) : undefined });
    setEditing(false);
  };

  const logout = () => {
    signOut();
    router.replace('/auth');
  };

  const Stat = ({ value, label }: { value: number; label: string }) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontFamily: FONTS.serif, fontSize: 30, color: palette.text }}>{value}</Text>
      <Text style={{ fontFamily: FONTS.sans, fontSize: 11.5, color: palette.textFaint, marginTop: 2 }}>{label}</Text>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={{ width: 44 }} />
            <MicroLabel>{t('tab_profile').toLowerCase()}</MicroLabel>
            <GlassIconButton onPress={() => router.push('/settings')}>
              <Gear color={palette.text} size={20} />
            </GlassIconButton>
          </View>

          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <Pressable onPress={pickPhoto}>
              <View
                style={[styles.avatar, { backgroundColor: palette.glassStrong, borderColor: palette.glassBorder }]}
              >
                {user?.photoUri ? (
                  <Image source={{ uri: user.photoUri }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Camera color={palette.textSoft} size={26} />
                )}
              </View>
            </Pressable>

            {editing ? (
              <View style={{ gap: 10, marginTop: 18, alignSelf: 'stretch', paddingHorizontal: 20 }}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t('setup_name')}
                  placeholderTextColor={palette.textFaint}
                  style={[styles.input, { backgroundColor: palette.glass, borderColor: palette.glassBorder, color: palette.text }]}
                />
                <TextInput
                  value={age}
                  onChangeText={(v) => setAge(v.replace(/[^0-9]/g, ''))}
                  placeholder={t('setup_age')}
                  placeholderTextColor={palette.textFaint}
                  keyboardType="number-pad"
                  maxLength={3}
                  style={[styles.input, { backgroundColor: palette.glass, borderColor: palette.glassBorder, color: palette.text }]}
                />
                <PrimaryButton label={t('save')} onPress={saveEdits} />
              </View>
            ) : (
              <>
                <Text style={{ fontFamily: FONTS.serif, fontSize: 32, color: palette.text, marginTop: 16 }}>
                  {user?.name || '—'}
                </Text>
                <Text style={{ fontFamily: FONTS.sans, fontSize: 13, color: palette.textFaint, marginTop: 4 }}>
                  {user?.age ? `${user.age} ${t('profile_age')} · ` : ''}
                  {user?.email}
                </Text>
                <Pressable onPress={() => setEditing(true)} style={styles.editRow} hitSlop={8}>
                  <Pencil color={palette.textSoft} size={14} />
                  <Text style={{ fontFamily: FONTS.sans, fontSize: 13, color: palette.textSoft }}>
                    {t('profile_edit')}
                  </Text>
                </Pressable>
              </>
            )}
          </View>

          <GlassCard style={{ marginTop: 28 }}>
            <View style={{ flexDirection: 'row' }}>
              <Stat value={pathDay} label={t('profile_days')} />
              <Stat value={sessions.length} label={t('profile_sessions')} />
              <Stat value={totalMin} label={t('profile_minutes')} />
            </View>
            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <PathTrail
                width={250}
                height={56}
                progress={Math.min(1, ((pathDay - 1) % 30) / 29)}
                color={palette.line}
                faint={palette.textFaint}
              />
            </View>
          </GlassCard>

          <Pressable onPress={logout} style={styles.logout} hitSlop={8}>
            <Logout color={palette.textFaint} size={17} />
            <Text style={{ fontFamily: FONTS.sans, fontSize: 14, color: palette.textFaint }}>
              {t('profile_logout')}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingBottom: 130 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  input: {
    height: 52,
    borderRadius: RADII.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    fontFamily: FONTS.sans,
    fontSize: 15,
  },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 30 },
});
