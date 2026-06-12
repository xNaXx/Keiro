import React, { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeView } from '../src/screens/HomeView';
import { LibraryView } from '../src/screens/LibraryView';
import { ProfileView } from '../src/screens/ProfileView';
import { Home, Library, UserIcon } from '../src/components/Icons';
import { Tap } from '../src/components/UI';
import { useApp } from '../src/store';
import { FONTS } from '../src/theme';

const PAGES = 3;

/**
 * The three main screens live in one horizontal pager so a swipe drags the
 * whole screen along with the finger (touch or mouse) — Inicio ⇄ Biblioteca ⇄ Perfil.
 */
export default function MainPager() {
  const { palette, t } = useApp();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);
  const x = useRef(new Animated.Value(0)).current;

  const snapTo = (idx: number) => {
    const i = Math.max(0, Math.min(PAGES - 1, idx));
    pageRef.current = i;
    setPage(i);
    Animated.spring(x, { toValue: -i * width, useNativeDriver: true, speed: 10, bounciness: 0 }).start();
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
      onPanResponderMove: (_, g) => {
        const base = -pageRef.current * width;
        let next = base + g.dx;
        // soft resistance at the edges
        if (next > 0) next = next / 3;
        const min = -(PAGES - 1) * width;
        if (next < min) next = min + (next - min) / 3;
        x.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const threshold = width * 0.22;
        if (g.dx < -threshold || g.vx < -0.4) snapTo(pageRef.current + 1);
        else if (g.dx > threshold || g.vx > 0.4) snapTo(pageRef.current - 1);
        else snapTo(pageRef.current);
      },
      onPanResponderTerminate: () => snapTo(pageRef.current),
    })
  ).current;

  const items = [
    { icon: Home, label: t('tab_home') },
    { icon: Library, label: t('tab_library') },
    { icon: UserIcon, label: t('tab_profile') },
  ];

  return (
    <View style={{ flex: 1, overflow: 'hidden' }} {...pan.panHandlers}>
      <Animated.View
        style={{
          flexDirection: 'row',
          width: width * PAGES,
          height: '100%',
          transform: [{ translateX: x }],
        }}
      >
        <View style={{ width, height: '100%' }}>
          <HomeView />
        </View>
        <View style={{ width, height: '100%' }}>
          <LibraryView />
        </View>
        <View style={{ width, height: '100%' }}>
          <ProfileView />
        </View>
      </Animated.View>

      <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]} pointerEvents="box-none">
        <BlurView
          intensity={36}
          tint={palette.name === 'dark' ? 'dark' : 'light'}
          style={[styles.bar, { backgroundColor: palette.glass, borderColor: palette.glassBorder }]}
        >
          {items.map((item, idx) => {
            const focused = page === idx;
            const Icon = item.icon;
            return (
              <Tap key={item.label} onPress={() => snapTo(idx)} style={styles.item} hitSlop={6} scaleTo={0.92}>
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
    </View>
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
  item: { alignItems: 'center', paddingHorizontal: 18, paddingVertical: 4, minWidth: 72 },
});
