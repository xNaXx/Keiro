import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DARK, LIGHT, Palette, ThemeMode } from './theme';
import { Language, translate } from './i18n';
import { Meditation } from './data';

export interface User {
  name: string;
  age?: number;
  photoUri?: string;
  email?: string;
  provider: 'google' | 'facebook' | 'apple' | 'email';
  /** first day of the path, used for "Día N de tu sendero" */
  startedAt: number;
}

interface AppState {
  hydrated: boolean;
  onboarded: boolean;
  user: User | null;
  themeMode: ThemeMode;
  language: Language;
  preferredVoice: string;
  sessions: Meditation[];

  setOnboarded: (v: boolean) => void;
  signIn: (u: Omit<User, 'startedAt'>) => void;
  updateUser: (patch: Partial<User>) => void;
  signOut: () => void;
  setThemeMode: (m: ThemeMode) => void;
  setLanguage: (l: Language) => void;
  setPreferredVoice: (v: string) => void;
  addSession: (m: Meditation) => void;
  toggleDownload: (id: string) => void;

  palette: Palette;
  t: (key: string, vars?: Record<string, string | number>) => string;
  pathDay: number;
}

const Ctx = createContext<AppState | null>(null);
const KEY = 'keiro:v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [hydrated, setHydrated] = useState(false);
  const [onboarded, setOnboardedState] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [language, setLanguageState] = useState<Language>('es');
  const [preferredVoice, setPreferredVoiceState] = useState('lua');
  const [sessions, setSessions] = useState<Meditation[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const d = JSON.parse(raw);
          setOnboardedState(!!d.onboarded);
          setUser(d.user ?? null);
          setThemeModeState(d.themeMode ?? 'system');
          setLanguageState(d.language ?? 'es');
          setPreferredVoiceState(d.preferredVoice ?? 'lua');
          setSessions(d.sessions ?? []);
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      KEY,
      JSON.stringify({ onboarded, user, themeMode, language, preferredVoice, sessions })
    ).catch(() => {});
  }, [hydrated, onboarded, user, themeMode, language, preferredVoice, sessions]);

  const palette = useMemo(() => {
    const mode = themeMode === 'system' ? (system ?? 'light') : themeMode;
    return mode === 'dark' ? DARK : LIGHT;
  }, [themeMode, system]);

  const pathDay = useMemo(() => {
    if (!user) return 1;
    return Math.max(1, Math.floor((Date.now() - user.startedAt) / 86400000) + 1);
  }, [user]);

  const value: AppState = {
    hydrated,
    onboarded,
    user,
    themeMode,
    language,
    preferredVoice,
    sessions,
    setOnboarded: setOnboardedState,
    signIn: (u) => setUser({ ...u, startedAt: Date.now() }),
    updateUser: (patch) => setUser((prev) => (prev ? { ...prev, ...patch } : prev)),
    signOut: () => {
      setUser(null);
      setSessions([]);
    },
    setThemeMode: setThemeModeState,
    setLanguage: setLanguageState,
    setPreferredVoice: setPreferredVoiceState,
    addSession: (m) => setSessions((prev) => [m, ...prev].slice(0, 60)),
    toggleDownload: (id) =>
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, downloaded: !s.downloaded } : s))),
    palette,
    t: (key, vars) => translate(key, language, vars),
    pathDay,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
}
