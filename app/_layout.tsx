import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import {
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import { AppProvider, useApp } from '../src/store';

function Root() {
  const { palette, hydrated } = useApp();
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: '#0b1026' }} />;
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
