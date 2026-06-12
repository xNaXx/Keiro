import { EnergyId, VOICES } from '../data';

/**
 * Real text-to-speech via ElevenLabs.
 * Configure EXPO_PUBLIC_ELEVENLABS_API_KEY to enable it; without a key the
 * player runs in demo mode (timed transcript + ambient sound).
 *
 * The voices in src/data.ts map to ElevenLabs premade voices and use the
 * eleven_multilingual_v2 model, which produces natural, human deliveries in
 * both Spanish and English.
 *
 * NOTE for production: proxy this through your backend to keep the key safe.
 */

const API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

export function hasElevenLabsKey(): boolean {
  return typeof API_KEY === 'string' && API_KEY.length > 0;
}

/** Map Keiro's "energy" setting onto ElevenLabs voice settings. */
function voiceSettings(energy: EnergyId) {
  switch (energy) {
    case 'whisper':
      return { stability: 0.85, similarity_boost: 0.7, style: 0.05, speed: 0.85 };
    case 'serene':
      return { stability: 0.75, similarity_boost: 0.75, style: 0.15, speed: 0.9 };
    case 'warm':
      return { stability: 0.6, similarity_boost: 0.8, style: 0.35, speed: 0.95 };
    case 'bright':
      return { stability: 0.5, similarity_boost: 0.8, style: 0.5, speed: 1.0 };
  }
}

/**
 * Synthesize a meditation script. Lines are joined with break tags so the
 * narration breathes. Returns a playable URI (blob/object URL on web,
 * a file URI on native once expo-file-system writing is wired in).
 */
export async function synthesize(
  lines: string[],
  voiceId: string,
  energy: EnergyId
): Promise<string> {
  const voice = VOICES.find((v) => v.id === voiceId) ?? VOICES[0];
  const text = lines.join(' <break time="3.0s" /> ');

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.elevenLabsId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'xi-api-key': API_KEY! },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voiceSettings(energy),
      }),
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs error ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
