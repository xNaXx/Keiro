import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { GradientBackground } from '../src/components/GradientBackground';
import { Body, MicroLabel, PrimaryButton, Title } from '../src/components/UI';
import { Camera } from '../src/components/Icons';
import { useApp } from '../src/store';
import { FONTS, RADII } from '../src/theme';

export default function Setup() {
  const { t, palette, user, updateUser } = useApp();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [photo, setPhoto] = useState<string | undefined>(user?.photoUri);
  const [gender, setGender] = useState<'male' | 'female' | undefined>(user?.gender);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled && res.assets[0]) setPhoto(res.assets[0].uri);
  };

  const start = () => {
    updateUser({ name: name.trim() || 'Viajero', age: age ? Number(age) : undefined, photoUri: photo, gender });
    router.replace('/home');
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.fill}>
        <View style={styles.content}>
          <MicroLabel>{t('ob_tag')}</MicroLabel>
          <View style={{ height: 12 }} />
          <Title>{t('setup_title')}</Title>
          <View style={{ height: 10 }} />
          <Body>{t('setup_body')}</Body>

          <Pressable onPress={pickPhoto} style={{ marginTop: 34, alignItems: 'center' }}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: palette.glassStrong, borderColor: palette.glassBorder },
              ]}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.avatarImg} />
              ) : (
                <Camera color={palette.textSoft} size={28} />
              )}
            </View>
            <Text style={{ fontFamily: FONTS.sans, fontSize: 13, color: palette.textFaint, marginTop: 10 }}>
              {photo ? t('setup_change_photo') : t('setup_photo')}
            </Text>
          </Pressable>

          <View style={{ gap: 12, marginTop: 30, alignSelf: 'stretch' }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('setup_name')}
              placeholderTextColor={palette.textFaint}
              style={[
                styles.input,
                { backgroundColor: palette.glass, borderColor: palette.glassBorder, color: palette.text },
              ]}
            />
            <TextInput
              value={age}
              onChangeText={(v) => setAge(v.replace(/[^0-9]/g, ''))}
              placeholder={t('setup_age')}
              placeholderTextColor={palette.textFaint}
              keyboardType="number-pad"
              maxLength={3}
              style={[
                styles.input,
                { backgroundColor: palette.glass, borderColor: palette.glassBorder, color: palette.text },
              ]}
            />
            <Text style={{ fontFamily: FONTS.sans, fontSize: 13, color: palette.textFaint, textAlign: 'center', marginTop: 4 }}>
              {t('gender_q')}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(['male', 'female'] as const).map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setGender(g)}
                  style={[
                    styles.genderChip,
                    {
                      backgroundColor: gender === g ? palette.selectedBg : palette.glass,
                      borderColor: gender === g ? palette.selectedBorder : palette.glassBorder,
                    },
                  ]}
                >
                  <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 14, color: palette.text }}>
                    {t(g === 'male' ? 'gender_m' : 'gender_f')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 28, paddingBottom: 28 }}>
          <PrimaryButton label={t('setup_start')} onPress={start} />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  input: {
    height: 54,
    borderRadius: RADII.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 22,
    fontFamily: FONTS.sans,
    fontSize: 15,
  },
  genderChip: {
    flex: 1,
    height: 48,
    borderRadius: RADII.button,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
