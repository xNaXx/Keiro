import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { GradientBackground } from '../src/components/GradientBackground';
import { Sparkle } from '../src/components/Sparkle';
import { AppleLogo, FacebookLogo, GoogleLogo } from '../src/components/Icons';
import { Body, MicroLabel, PrimaryButton } from '../src/components/UI';
import { useApp } from '../src/store';
import { FONTS, RADII } from '../src/theme';

type Provider = 'google' | 'facebook' | 'apple' | 'email';

export default function Auth() {
  const { t, palette, signIn } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dark = palette.name === 'dark';

  const go = (provider: Provider) => {
    // Simulated auth: a real backend (Supabase/Firebase) plugs in here.
    const demoEmail =
      provider === 'email' && email ? email : `you@${provider === 'email' ? 'keiro.app' : provider + '.com'}`;
    signIn({ name: '', provider, email: demoEmail });
    router.replace('/setup');
  };

  const SocialButton = ({
    icon,
    label,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
  }) => (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <BlurView
        intensity={26}
        tint={dark ? 'dark' : 'light'}
        style={[styles.social, { backgroundColor: palette.glassStrong, borderColor: palette.glassBorder }]}
      >
        {icon}
        <Text style={{ fontFamily: FONTS.sansMedium, fontSize: 15, color: palette.text }}>{label}</Text>
      </BlurView>
    </Pressable>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.logoBlock}>
              <Sparkle size={26} color={palette.text} twinkle />
              <Text style={[styles.wordmark, { color: palette.text }]}>Keiro</Text>
              <MicroLabel>{t('ob_tag')}</MicroLabel>
            </View>

            <Text style={[styles.welcome, { color: palette.text }]}>{t('auth_welcome')}</Text>

            <View style={{ gap: 12, marginTop: 28 }}>
              <SocialButton icon={<GoogleLogo size={20} />} label={t('auth_google')} onPress={() => go('google')} />
              <SocialButton icon={<FacebookLogo size={20} />} label={t('auth_facebook')} onPress={() => go('facebook')} />
              <SocialButton
                icon={<AppleLogo size={20} color={palette.text} />}
                label={t('auth_apple')}
                onPress={() => go('apple')}
              />
            </View>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: palette.glassBorder }]} />
              <Text style={{ fontFamily: FONTS.sans, fontSize: 13, color: palette.textFaint }}>{t('auth_or')}</Text>
              <View style={[styles.divider, { backgroundColor: palette.glassBorder }]} />
            </View>

            <View style={{ gap: 12 }}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth_email')}
                placeholderTextColor={palette.textFaint}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[
                  styles.input,
                  { backgroundColor: palette.glass, borderColor: palette.glassBorder, color: palette.text },
                ]}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth_password')}
                placeholderTextColor={palette.textFaint}
                secureTextEntry
                style={[
                  styles.input,
                  { backgroundColor: palette.glass, borderColor: palette.glassBorder, color: palette.text },
                ]}
              />
              <PrimaryButton
                label={mode === 'register' ? t('auth_register') : t('auth_login')}
                onPress={() => go('email')}
              />
            </View>

            <Pressable
              onPress={() => setMode(mode === 'register' ? 'login' : 'register')}
              style={{ marginTop: 22, alignItems: 'center' }}
              hitSlop={8}
            >
              <Body faint>{mode === 'register' ? t('auth_have_account') : t('auth_no_account')}</Body>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 30 },
  logoBlock: { alignItems: 'center', gap: 8, marginBottom: 30 },
  wordmark: { fontFamily: FONTS.serif, fontSize: 44, letterSpacing: 2 },
  welcome: { fontFamily: FONTS.sans, fontSize: 22, textAlign: 'center' },
  social: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: RADII.button,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 24 },
  divider: { flex: 1, height: StyleSheet.hairlineWidth },
  input: {
    height: 54,
    borderRadius: RADII.button,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 22,
    fontFamily: FONTS.sans,
    fontSize: 15,
  },
});
