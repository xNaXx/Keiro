import { Language } from './i18n';

export interface Mood {
  id: string;
  label: { es: string; en: string };
  /** word shown big in the player, serif */
  feeling: { es: string; en: string };
}

export const MOODS: Mood[] = [
  { id: 'anxiety', label: { es: 'Ansiedad', en: 'Anxiety' }, feeling: { es: 'Ansiedad', en: 'Anxiety' } },
  { id: 'sadness', label: { es: 'Tristeza', en: 'Sadness' }, feeling: { es: 'Tristeza', en: 'Sadness' } },
  { id: 'worry', label: { es: 'Preocupación', en: 'Worry' }, feeling: { es: 'Preocupación', en: 'Worry' } },
  { id: 'stress', label: { es: 'Estrés', en: 'Stress' }, feeling: { es: 'Estrés', en: 'Stress' } },
  { id: 'insomnia', label: { es: 'Insomnio', en: 'Insomnia' }, feeling: { es: 'Insomnio', en: 'Insomnia' } },
  { id: 'calm', label: { es: 'Calma', en: 'Calm' }, feeling: { es: 'Serenidad', en: 'Peace' } },
  { id: 'gratitude', label: { es: 'Gratitud', en: 'Gratitude' }, feeling: { es: 'Gratitud', en: 'Gratitude' } },
  { id: 'focus', label: { es: 'Enfoque', en: 'Focus' }, feeling: { es: 'Claridad', en: 'Clarity' } },
];

export interface Voice {
  id: string;
  /** ElevenLabs premade voice id — used when a real API key is configured */
  elevenLabsId: string;
  name: { es: string; en: string };
  gender: 'female' | 'male';
  desc: { es: string; en: string };
  /** tint for the voice card orb */
  tint: string;
}

export const VOICES: Voice[] = [
  {
    id: 'lua',
    elevenLabsId: '21m00Tcm4TlvDq8ikWAM',
    name: { es: 'Lúa', en: 'Lua' },
    gender: 'female',
    desc: { es: 'Cálida y cercana', en: 'Warm and close' },
    tint: '#f2b06f',
  },
  {
    id: 'aria',
    elevenLabsId: 'EXAVITQu4vr4xnSDxMaL',
    name: { es: 'Aria', en: 'Aria' },
    gender: 'female',
    desc: { es: 'Serena y cristalina', en: 'Serene and crystal-clear' },
    tint: '#8fb4ef',
  },
  {
    id: 'mateo',
    elevenLabsId: 'ErXwobaYiN019PkySvjV',
    name: { es: 'Mateo', en: 'Matteo' },
    gender: 'male',
    desc: { es: 'Profundo y sereno', en: 'Deep and steady' },
    tint: '#a18ae6',
  },
  {
    id: 'noah',
    elevenLabsId: 'TxGEqnHWrfWFTfGW9XjX',
    name: { es: 'Noah', en: 'Noah' },
    gender: 'male',
    desc: { es: 'Suave y luminoso', en: 'Soft and bright' },
    tint: '#73bdb4',
  },
];

export const DURATIONS = [3, 5, 10, 15, 20];

export type MomentId = 'morning' | 'midday' | 'evening' | 'night';
export const MOMENTS: { id: MomentId; tKey: string; icon: 'sunrise' | 'sun' | 'sunset' | 'moon' }[] = [
  { id: 'morning', tKey: 'moment_morning', icon: 'sunrise' },
  { id: 'midday', tKey: 'moment_midday', icon: 'sun' },
  { id: 'evening', tKey: 'moment_evening', icon: 'sunset' },
  { id: 'night', tKey: 'moment_night', icon: 'moon' },
];

export type EnergyId = 'whisper' | 'serene' | 'warm' | 'bright';
export const ENERGIES: { id: EnergyId; tKey: string; dKey: string }[] = [
  { id: 'whisper', tKey: 'energy_whisper', dKey: 'energy_whisper_d' },
  { id: 'serene', tKey: 'energy_serene', dKey: 'energy_serene_d' },
  { id: 'warm', tKey: 'energy_warm', dKey: 'energy_warm_d' },
  { id: 'bright', tKey: 'energy_bright', dKey: 'energy_bright_d' },
];

export interface SessionConfig {
  mood: string;
  moment: MomentId;
  durationMin: number;
  voiceId: string;
  energy: EnergyId;
  language: Language;
  mode: 'simple' | 'advanced';
}

export interface MeditationLine {
  /** seconds from start when the line appears */
  at: number;
  text: string;
}

export interface Meditation {
  id: string;
  title: string;
  config: SessionConfig;
  lines: MeditationLine[];
  durationSec: number;
  createdAt: number;
  downloaded: boolean;
  /** uri of synthesized audio when generated with a real TTS key */
  audioUri?: string;
}

export function currentMoment(): MomentId {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'midday';
  if (h < 21) return 'evening';
  return 'night';
}
