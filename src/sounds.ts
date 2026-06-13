import { Asset } from 'expo-asset';
import catalog from '../assets/sounds/catalog.json';

/**
 * Ambient loop catalog (CC0, from Freesound, processed seamless by
 * scripts/gen-sounds.mjs). Each entry resolves to a playable URI consumed by
 * the soundscape mixer.
 */
export interface SoundDef {
  key: string;
  name: { es: string; en: string };
  tint: string;
  file: string;
  loopSec: number;
  uri: string;
}

const AUDIO: Record<string, any> = {
  water: require('../assets/sounds/water.mp3'),
  rain: require('../assets/sounds/rain.mp3'),
  waves: require('../assets/sounds/waves.mp3'),
  wind: require('../assets/sounds/wind.mp3'),
  fire: require('../assets/sounds/fire.mp3'),
  bowls: require('../assets/sounds/bowls.mp3'),
  chimes: require('../assets/sounds/chimes.mp3'),
};

function audioUri(key: string): string {
  const mod = AUDIO[key];
  if (!mod) return '';
  if (typeof mod === 'string') return mod;
  if (typeof mod === 'object' && mod.uri) return mod.uri as string;
  try {
    return Asset.fromModule(mod).uri;
  } catch {
    return '';
  }
}

export const SOUNDS: SoundDef[] = (catalog as Omit<SoundDef, 'uri'>[]).map((s) => ({
  ...s,
  uri: audioUri(s.key),
}));
