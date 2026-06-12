/**
 * Music generation adapter — placeholder for the production build.
 *
 * Plan: generate bespoke ambient beds per session (mood + energy + duración)
 * with Suno (or a licensed stem library as fallback), then mix them under the
 * ElevenLabs narration server-side with the same ducking curve the demo
 * player uses (voice speaks → bed at ~30%, silence → bed swells back).
 *
 * Suno currently has no public self-serve API; when access is available this
 * module exposes `generateBed(config) → audio URL`, and the player swaps the
 * Web-Audio pad for the streamed bed with zero UI changes.
 */

import { EnergyId } from '../data';

export function hasSunoKey(): boolean {
  const key = process.env.EXPO_PUBLIC_SUNO_API_KEY;
  return typeof key === 'string' && key.length > 0;
}

export interface MusicBedRequest {
  mood: string;
  energy: EnergyId;
  durationSec: number;
}

export async function generateBed(_req: MusicBedRequest): Promise<string> {
  throw new Error('Suno integration pending — demo pad is used instead.');
}
