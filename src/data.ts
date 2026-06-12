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
  /** premium-only voice */
  premium?: boolean;
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
    premium: true,
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
    premium: true,
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

export type SoundType = 'ambient' | 'hz';

export interface HzOption {
  freq: number;
  name: { es: string; en: string };
  desc: { es: string; en: string };
  tint: string;
}

/** The nine solfeggio frequencies, each with its traditional intention. */
export const HZ_OPTIONS: HzOption[] = [
  { freq: 174, name: { es: 'Alivio', en: 'Relief' }, desc: { es: 'Calma el dolor físico y emocional', en: 'Eases physical & emotional pain' }, tint: '#3b3a78' },
  { freq: 285, name: { es: 'Regeneración', en: 'Renewal' }, desc: { es: 'Regenera tejidos y aumenta la energía', en: 'Regenerates tissue, lifts energy' }, tint: '#67d4b8' },
  { freq: 396, name: { es: 'Liberación', en: 'Release' }, desc: { es: 'Libera la culpa y el miedo', en: 'Releases guilt and fear' }, tint: '#d83a3a' },
  { freq: 417, name: { es: 'Cambio', en: 'Change' }, desc: { es: 'Facilita el cambio y limpia lo negativo', en: 'Facilitates change, clears negativity' }, tint: '#e8842c' },
  { freq: 528, name: { es: 'Amor', en: 'Love' }, desc: { es: 'La frecuencia del amor y la transformación', en: 'The love & transformation frequency' }, tint: '#e8c531' },
  { freq: 639, name: { es: 'Armonía', en: 'Harmony' }, desc: { es: 'Equilibra emociones y relaciones', en: 'Balances emotions & relationships' }, tint: '#7cb83a' },
  { freq: 741, name: { es: 'Expresión', en: 'Expression' }, desc: { es: 'Despeja la mente y la voz propia', en: 'Clears the mind and your own voice' }, tint: '#4a78e0' },
  { freq: 852, name: { es: 'Intuición', en: 'Intuition' }, desc: { es: 'Despierta la intuición y la fuerza interior', en: 'Awakens intuition & inner strength' }, tint: '#7a4fd0' },
  { freq: 963, name: { es: 'Consciencia', en: 'Awareness' }, desc: { es: 'Conexión y visión elevada', en: 'Connection & higher vision' }, tint: '#c34fd0' },
];

/** How often the voice speaks during the session. */
export type VoiceDensity = 'low' | 'medium' | 'high';

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
  soundType: SoundType;
  /** solfeggio frequency when soundType === 'hz' */
  hzFreq?: number;
  density: VoiceDensity;
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
