import { Asset } from 'expo-asset';
import catalog from '../assets/meditations/catalog.json';
import { Meditation, SessionConfig } from './data';
import { Language } from './i18n';

/**
 * Pre-generated meditations with real ElevenLabs voices (the n=2 seed of the
 * library). The audio + line timings live in assets/meditations/, produced by
 * scripts/gen-meditations.mjs. Here we turn each catalog entry into a full
 * Meditation the player and library already know how to render.
 */

export interface PrebuiltEntry {
  id: string;
  voice: string;
  gender: 'male' | 'female';
  mood: string;
  lang: Language;
  title: { es: string; en: string };
  durationSec: number;
  file: string;
  lines: { at: number; text: string }[];
}

export const PREBUILT_CATALOG = catalog as PrebuiltEntry[];

// Static requires so Metro bundles each clip; map by id.
const AUDIO: Record<string, any> = {
  'calm-lua-es': require('../assets/meditations/calm-lua-es.mp3'),
  'calm-mateo-es': require('../assets/meditations/calm-mateo-es.mp3'),
};

/** Resolve a bundled audio module to a playable URI (web string, native asset). */
function audioUri(id: string): string {
  const mod = AUDIO[id];
  if (!mod) return '';
  if (typeof mod === 'string') return mod;
  if (typeof mod === 'object' && mod.uri) return mod.uri as string;
  try {
    return Asset.fromModule(mod).uri;
  } catch {
    return '';
  }
}

function toMeditation(e: PrebuiltEntry, language: Language): Meditation {
  const config: SessionConfig = {
    mood: e.mood,
    moment: 'evening',
    durationMin: Math.max(1, Math.round(e.durationSec / 60)),
    voiceId: e.voice,
    energy: 'serene',
    language: e.lang,
    mode: 'advanced',
    soundType: 'ambient',
    density: 'medium',
  };
  return {
    id: e.id,
    title: e.title[language] ?? e.title.es,
    config,
    lines: e.lines,
    durationSec: e.durationSec,
    createdAt: 0,
    downloaded: false,
    audioUri: audioUri(e.id),
  };
}

/** All pre-generated meditations, titles localized. */
export function getPrebuilt(language: Language): Meditation[] {
  return PREBUILT_CATALOG.map((e) => toMeditation(e, language));
}

/** Look one up by id (used by the player when it isn't in the user's sessions). */
export function findPrebuilt(id: string, language: Language): Meditation | undefined {
  const e = PREBUILT_CATALOG.find((x) => x.id === id);
  return e ? toMeditation(e, language) : undefined;
}
