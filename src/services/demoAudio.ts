import { Platform } from 'react-native';
import { Language } from '../i18n';

/**
 * Demo-mode audio, web only. Until real keys are connected the player still
 * needs to *sound* like something: a soft ambient pad generated with the
 * Web Audio API, plus the browser's speech synthesis reading the meditation.
 *
 * The pad ducks under the voice and swells back in the silences. For the
 * production build the plan is Suno (or licensed stems) for music and
 * ElevenLabs for narration — see src/services/suno.ts and elevenlabs.ts.
 */

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

// Chrome quirks: voices load async, and the synth engine silently pauses
// after ~15s idle. Warm the voice list up and keep the engine awake.
if (isWeb && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  setInterval(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) return;
    window.speechSynthesis.resume();
  }, 5000);
}

const LEVEL_FULL = 0.04;
const LEVEL_DUCKED = 0.012;

let musicVol = 1;
let voiceVol = 1;
let currentLevel: 'full' | 'ducked' = 'full';

/** 0..1 — scales the pad in real time. */
export function setMusicVolume(v: number) {
  musicVol = Math.max(0, Math.min(1, v));
  rampAmbient(currentLevel === 'full' ? LEVEL_FULL : LEVEL_DUCKED, 0.15);
}

/** 0..1 — applies to the next spoken line. */
export function setVoiceVolume(v: number) {
  voiceVol = Math.max(0, Math.min(1, v));
}

export function getVolumes() {
  return { music: musicVol, voice: voiceVol };
}

let ctx: AudioContext | null = null;
let ambient: { nodes: AudioNode[]; gain: GainNode } | null = null;

function audioCtx(): AudioContext | null {
  if (!isWeb) return null;
  const AC = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** Build the pad into any BaseAudioContext (live or offline render). */
function buildPad(ac: BaseAudioContext, destination: AudioNode, durationSec?: number, hz?: number) {
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = hz ? Math.max(1200, hz * 1.6) : 600;

  // solfeggio mode: the pure tone, an octave below for body, a faint fifth
  const freqs = hz ? [hz, hz / 2, hz * 1.5] : [110, 164.81, 220, 329.63];
  const nodes: AudioNode[] = [];
  freqs.forEach((f, i) => {
    const osc = ac.createOscillator();
    osc.type = hz ? 'sine' : i % 2 ? 'sine' : 'triangle';
    osc.frequency.value = f;
    osc.detune.value = (i - 1.5) * 3;
    osc.connect(filter);
    osc.start();
    if (durationSec) osc.stop(durationSec);
    nodes.push(osc);
  });

  // slow breathing on its OWN gain stage — never on the ducking param,
  // otherwise cancelScheduledValues snaps the value and clicks audibly
  const breath = ac.createGain();
  breath.gain.value = 1;
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.25;
  lfo.connect(lfoGain);
  lfoGain.connect(breath.gain);
  lfo.start();
  if (durationSec) lfo.stop(durationSec);
  nodes.push(lfo);

  filter.connect(breath);
  breath.connect(gain);
  gain.connect(destination);
  return { nodes, gain };
}

export function startAmbient(hz?: number) {
  const ac = audioCtx();
  if (!ac || ambient) return;
  ambient = buildPad(ac, ac.destination, undefined, hz);
  ambient.gain.gain.value = 0;
  currentLevel = 'full';
  // soft fade in — nothing in Keiro starts abruptly
  ambient.gain.gain.linearRampToValueAtTime(LEVEL_FULL * musicVol, ac.currentTime + 5);
}

/** Glide the pad toward a level (used for ducking under the voice). */
function rampAmbient(level: number, seconds: number) {
  if (!ambient || !ctx) return;
  currentLevel = level >= LEVEL_FULL ? 'full' : 'ducked';
  const g = ambient.gain.gain;
  g.cancelScheduledValues(ctx.currentTime);
  g.setValueAtTime(g.value, ctx.currentTime);
  g.linearRampToValueAtTime(level * musicVol, ctx.currentTime + seconds);
}

/** Long goodbye for the end of a session. */
export function fadeOutAmbient(seconds = 8) {
  rampAmbient(0.0001, seconds);
}

export function stopAmbient() {
  if (!ambient || !ctx) return;
  const { nodes, gain } = ambient;
  ambient = null;
  gain.gain.cancelScheduledValues(ctx.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
  setTimeout(
    () =>
      nodes.forEach((n) => {
        try {
          (n as OscillatorNode).stop();
        } catch {}
      }),
    1400
  );
}

function pickBrowserVoice(lang: Language, gender: 'female' | 'male'): SpeechSynthesisVoice | null {
  if (!isWeb || !('speechSynthesis' in window)) return null;
  const all = window.speechSynthesis.getVoices();
  const prefix = lang === 'es' ? 'es' : 'en';
  const candidates = all.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  if (!candidates.length) return all[0] ?? null;
  const maleHints = /male|jorge|diego|carlos|pablo|david|daniel|alex|george|guy/i;
  const femaleHints = /female|monica|mónica|paulina|lucia|lucía|elvira|helena|sabina|zira|susan|samantha|victoria/i;
  const hinted = candidates.find((v) => (gender === 'male' ? maleHints : femaleHints).test(v.name));
  return hinted ?? candidates[0];
}

/**
 * Speak one meditation line. The pad ducks while the voice speaks and
 * swells back gradually once it goes quiet.
 */
export function speakLine(text: string, lang: Language, gender: 'female' | 'male' = 'female') {
  if (!isWeb || !('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  synth.resume();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'es' ? 'es-ES' : 'en-US';
  u.rate = 0.82;
  u.pitch = gender === 'male' ? 0.85 : 1.0;
  u.volume = voiceVol;
  const voice = pickBrowserVoice(lang, gender);
  if (voice) u.voice = voice;
  u.onstart = () => {
    rampAmbient(LEVEL_DUCKED, 0.7);
    speakingListener?.(true);
  };
  u.onend = () => {
    rampAmbient(LEVEL_FULL, 3);
    speakingListener?.(false);
  };
  u.onerror = () => {
    rampAmbient(LEVEL_FULL, 3);
    speakingListener?.(false);
  };
  // safety: if onend never fires (Chrome bug), un-duck after an estimate
  const estMs = Math.max(3000, text.length * 90);
  setTimeout(() => {
    if (!synth.speaking) {
      rampAmbient(LEVEL_FULL, 3);
      speakingListener?.(false);
    }
  }, estMs);
  synth.speak(u);
}

let speakingListener: ((speaking: boolean) => void) | null = null;

/** Subscribe to voice activity (drives the Siri-like orb in the player). */
export function onSpeaking(cb: (speaking: boolean) => void): () => void {
  speakingListener = cb;
  return () => {
    if (speakingListener === cb) speakingListener = null;
  };
}

export function stopSpeech() {
  if (isWeb && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  speakingListener?.(false);
}

/** Short sample used by the voice-preview buttons. */
export function speakSample(lang: Language, gender: 'female' | 'male') {
  const sample =
    lang === 'es'
      ? 'Hola. Así sonará tu meditación. Respira… y camina conmigo.'
      : 'Hello. This is how your meditation will sound. Breathe… and walk with me.';
  speakLine(sample, lang, gender);
}

export function demoAudioAvailable(): boolean {
  return isWeb && 'speechSynthesis' in window;
}

/**
 * Render the ambient soundscape to a downloadable WAV (demo offline file).
 * With an ElevenLabs key connected the download is the real narrated mp3
 * instead — this is the fallback so "save offline" always yields audio.
 */
export async function renderAmbientWav(durationSec: number, hz?: number): Promise<Blob | null> {
  if (!isWeb || typeof OfflineAudioContext === 'undefined') return null;
  const rate = 22050;
  const total = Math.max(10, Math.round(durationSec));
  const oac = new OfflineAudioContext(1, rate * total, rate);
  const { gain } = buildPad(oac, oac.destination, total, hz);
  gain.gain.setValueAtTime(0, 0);
  gain.gain.linearRampToValueAtTime(0.35, 6); // louder than live: it plays alone
  gain.gain.setValueAtTime(0.35, Math.max(6, total - 10));
  gain.gain.linearRampToValueAtTime(0, total); // gentle fade out, never abrupt
  const buf = await oac.startRendering();

  // PCM 16-bit WAV encoding
  const samples = buf.getChannelData(0);
  const data = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const writeStr = (o: number, s: string) => [...s].forEach((c, i) => data.setUint8(o + i, c.charCodeAt(0)));
  writeStr(0, 'RIFF');
  data.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  data.setUint32(16, 16, true);
  data.setUint16(20, 1, true);
  data.setUint16(22, 1, true);
  data.setUint32(24, rate, true);
  data.setUint32(28, rate * 2, true);
  data.setUint16(32, 2, true);
  data.setUint16(34, 16, true);
  writeStr(36, 'data');
  data.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    data.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([data.buffer], { type: 'audio/wav' });
}
