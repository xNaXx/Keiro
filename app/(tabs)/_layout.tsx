import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Library, UserIcon } from '../../src/components/Icons';
import { Tap } from '../../src/components/UI';
import { useApp } from '../../src/store';
import { FONTS } from '../../src/theme';

function GlassTabBar({ state, navigation }: any) {
  const { palette, t } = useApp();
  const insets = useSafeAreaInsets();
  const items = [
    { name: 'index', icon: Home, label: t('tab_home') },
    { name: 'library', icon: Library, label: t('tab_library') },
    { name: 'profile', icon: UserIcon, label: t('tab_profile') },
  ];

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]} pointerEvents="box-none">
      <BlurView
        intensity={36}
        tint={palette.name === 'dark' ? 'dark' : 'light'}
        style={[styles.bar, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
      >
        {items.map((item, idx) => {
          const focused = state.index === idx;
          const Icon = item.icon;
          return (
            <Tap
              key={item.name}
              onPress={() => navigation.navigate(item.name)}
              style={styles.item}
              hitSlop={6}
              scaleTo={0.9}
            >
              <View style={{ alignItems: 'center', gap: 3 }}>
                <Icon color={focused ? palette.text : palette.textFaint} size={21} strokeWidth={focused ? 1.9 : 1.5} />
                <Text
                  style={{
                    fontFamily: focused ? FONTS.sansMedium : FONTS.sans,
                    fontSize: 10.5,
                    color: focused ? palette.text : palette.textFaint,
                  }}
                >
                  {item.label}
                </Text>
              </View>
            </Tap>
          );
        })}
      </BlurView>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <GlassTabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  item: { alignItems: 'center', gap: 3, paddingHorizontal: 18, paddingVertical: 4, minWidth: 72 },
});
