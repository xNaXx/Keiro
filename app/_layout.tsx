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

function Root() {
  const { palette, hydrated } = useApp();
  const veil = useRef(new Animated.Value(0)).current;
  const prevTheme = useRef(palette.name);

  // theme changes melt through a soft veil instead of cutting
  useEffect(() => {
    if (prevTheme.current !== palette.name) {
      prevTheme.current = palette.name;
      veil.setValue(1);
      Animated.timing(veil, { toValue: 0, duration: 900, useNativeDriver: true }).start();
    }
  }, [palette.name, veil]);

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
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg[1], opacity: veil }]}
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
