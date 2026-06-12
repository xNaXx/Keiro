import { Platform } from 'react-native';
import { Language } from '../i18n';

/**
 * Demo-mode audio, web only. Until real ElevenLabs keys are connected the
 * player still needs to *sound* like something: a soft ambient pad generated
 * with the Web Audio API, plus the browser's speech synthesis reading the
 * meditation lines. The browser voice is a placeholder — the production path
 * (src/services/elevenlabs.ts) replaces it with natural human voices.
 */

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

let ctx: AudioContext | null = null;
let ambientNodes: { osc: OscillatorNode[]; gain: GainNode } | null = null;

function audioCtx(): AudioContext | null {
  if (!isWeb) return null;
  const AC = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** Gentle two-note pad with a slow shimmer. Volume stays far in the back. */
export function startAmbient() {
  const ac = audioCtx();
  if (!ac || ambientNodes) return;

  const gain = ac.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(0.035, ac.currentTime + 4);

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;

  const freqs = [110, 164.81, 220, 329.63]; // A2, E3, A3, E4 — an open, calm fifth
  const oscs = freqs.map((f, i) => {
    const osc = ac.createOscillator();
    osc.type = i % 2 ? 'sine' : 'triangle';
    osc.frequency.value = f;
    osc.detune.value = (i - 1.5) * 3;
    osc.connect(filter);
    osc.start();
    return osc;
  });

  // slow breathing of the pad
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.012;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  lfo.start();
  oscs.push(lfo);

  filter.connect(gain);
  gain.connect(ac.destination);
  ambientNodes = { osc: oscs, gain };
}

export function stopAmbient() {
  if (!ambientNodes || !ctx) return;
  const { osc, gain } = ambientNodes;
  ambientNodes = null;
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
  setTimeout(() => osc.forEach((o) => { try { o.stop(); } catch {} }), 1400);
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

/** Speak one meditation line with the browser's TTS (demo placeholder). */
export function speakLine(text: string, lang: Language, gender: 'female' | 'male' = 'female') {
  if (!isWeb || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === 'es' ? 'es-ES' : 'en-US';
  u.rate = 0.82;
  u.pitch = gender === 'male' ? 0.85 : 1.0;
  u.volume = 0.95;
  const voice = pickBrowserVoice(lang, gender);
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

export function stopSpeech() {
  if (isWeb && 'speechSynthesis' in window) window.speechSynthesis.cancel();
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
