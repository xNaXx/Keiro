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
  voiceName: string;
  gender: 'male' | 'female';
  mood: string;
  lang: Language;
  title: { es: string; en: string };
  durationSec: number;
  file: string;
  lines: { at: number; text: string }[];
}

export const PREBUILT_CATALOG = catalog as PrebuiltEntry[];

export type PrebuiltMeditation = Meditation & { voiceName: string };

// Static requires so Metro bundles each clip; map by id.
const AUDIO: Record<string, any> = {
  'calm-belen-es': require('../assets/meditations/calm-belen-es.mp3'),
  'calm-victor-es': require('../assets/meditations/calm-victor-es.mp3'),
  'calm-eve-en': require('../assets/meditations/calm-eve-en.mp3'),
  'calm-steve-en': require('../assets/meditations/calm-steve-en.mp3'),
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

function toMeditation(e: PrebuiltEntry, language: Language): PrebuiltMeditation {
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
    voiceName: e.voiceName,
    config,
    lines: e.lines,
    durationSec: e.durationSec,
    createdAt: 0,
    downloaded: false,
    audioUri: audioUri(e.id),
  };
}

/** Pre-generated meditations for the current language, titles localized. */
export function getPrebuilt(language: Language): PrebuiltMeditation[] {
  return PREBUILT_CATALOG.filter((e) => e.lang === language).map((e) => toMeditation(e, language));
}

/** Look one up by id (used by the player when it isn't in the user's sessions). */
export function findPrebuilt(id: string, language: Language): PrebuiltMeditation | undefined {
  const e = PREBUILT_CATALOG.find((x) => x.id === id);
  return e ? toMeditation(e, language) : undefined;
}

/**
 * The same meditation in the other voice/gender (same mood), if it exists —
 * lets the player switch male↔female on the fly. Returns null when there is
 * no sibling (e.g. a user-generated session).
 */
export function findSiblingVoice(id: string, language: Language): PrebuiltMeditation | null {
  const cur = PREBUILT_CATALOG.find((x) => x.id === id);
  if (!cur) return null;
  const sib = PREBUILT_CATALOG.find(
    (x) => x.mood === cur.mood && x.lang === cur.lang && x.gender !== cur.gender
  );
  return sib ? toMeditation(sib, language) : null;
}
