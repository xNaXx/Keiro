import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Animated, StyleSheet, View } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import {
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import { AppProvider, useApp } from '../src/store';
import { registerThemeFade } from '../src/themeFade';
import { UpgradeModal } from '../src/components/UpgradeModal';

function Root() {
  const { palette, hydrated } = useApp();
  const veil = useRef(new Animated.Value(0)).current;
  const [veilColor, setVeilColor] = React.useState(palette.bg[1]);
  const paletteRef = useRef(palette);
  paletteRef.current = palette;

  // veil rises in the OLD theme's color, the swap happens under full cover,
  // then the veil dissolves into the new theme — no flash anywhere
  useEffect(() => {
    return registerThemeFade((swap) => {
      setVeilColor(paletteRef.current.bg[1]);
      Animated.timing(veil, { toValue: 1, duration: 240, useNativeDriver: true }).start(() => {
        swap();
        Animated.timing(veil, { toValue: 0, duration: 800, useNativeDriver: true, delay: 60 }).start();
      });
    });
  }, [veil]);

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: '#171231' }} />;
  return (
    <>
      <StatusBar style={palette.name === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: palette.bg[0] },
        }}
      />
      <UpgradeModal />
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: veilColor, opacity: veil }]}
      />
    </>
  );
}

export default function Layout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
  });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#0b1026' }} />;
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
