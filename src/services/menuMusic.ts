import { Platform } from 'react-native';
import { SOUNDS } from '../sounds';

/**
 * Calm ambient bed for the browsing part of the app (home, mood, wizard…):
 * a soft synthesized chord that breathes, with the tibetan-bowls loop floating
 * low underneath. Plays until a meditation begins, then stops. Web Audio so it
 * loops gaplessly. Autoplay policy means it only starts after a user gesture —
 * by the time anyone reaches the menu they've already tapped, so ctx.resume()
 * succeeds.
 */

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let running = false;
let nodes: AudioNode[] = [];
let bowlsSource: AudioBufferSourceNode | null = null;
let bowlsBuffer: AudioBuffer | null = null;

const LEVEL = 0.32;

function audioCtx(): AudioContext | null {
  if (!isWeb) return null;
  const AC = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function buildPad(ac: AudioContext, dest: AudioNode) {
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 850;
  const breath = ac.createGain();
  breath.gain.value = 1;
  const freqs = [130.81, 196.0, 261.63, 392.0];
  freqs.forEach((f, i) => {
    const o = ac.createOscillator();
    o.type = i % 2 ? 'sine' : 'triangle';
    o.frequency.value = f;
    o.detune.value = (i - 1.5) * 4;
    o.connect(filter);
    o.start();
    nodes.push(o);
  });
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  lfo.frequency.value = 0.06;
  lfoGain.gain.value = 0.2;
  lfo.connect(lfoGain);
  lfoGain.connect(breath.gain);
  lfo.start();
  nodes.push(lfo);
  filter.connect(breath);
  breath.connect(dest);
}

async function loadBowls(ac: AudioContext) {
  if (bowlsBuffer) return;
  const def = SOUNDS.find((s) => s.key === 'bowls');
  if (!def?.uri) return;
  try {
    const res = await fetch(def.uri);
    bowlsBuffer = await ac.decodeAudioData(await res.arrayBuffer());
  } catch {
    /* no bowls bed; pad alone is fine */
  }
}

// The synthesized pad sounded eerie. Until a proper ambient track is supplied
// (drop an mp3 at assets/menu-music.mp3 and flip this on), the menu stays silent.
const USE_SYNTH_PAD = false;

export async function startMenuMusic(): Promise<void> {
  if (!USE_SYNTH_PAD) return;
  const ac = audioCtx();
  if (!ac || !master || running) return;
  running = true;
  buildPad(ac, master);
  await loadBowls(ac);
  if (running && bowlsBuffer && !bowlsSource) {
    const g = ac.createGain();
    g.gain.value = 0.5; // bowls sit softly under the pad
    const src = ac.createBufferSource();
    src.buffer = bowlsBuffer;
    src.loop = true;
    src.connect(g);
    g.connect(master);
    src.start();
    bowlsSource = src;
    nodes.push(g);
  }
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(master.gain.value, ac.currentTime);
  master.gain.linearRampToValueAtTime(LEVEL, ac.currentTime + 3);
}

export function stopMenuMusic(): void {
  if (!running || !ctx || !master) return;
  running = false;
  const ac = ctx;
  master.gain.cancelScheduledValues(ac.currentTime);
  master.gain.setValueAtTime(master.gain.value, ac.currentTime);
  master.gain.linearRampToValueAtTime(0, ac.currentTime + 1.2);
  const old = nodes;
  const oldSrc = bowlsSource;
  nodes = [];
  bowlsSource = null;
  setTimeout(() => {
    old.forEach((n) => {
      try {
        (n as OscillatorNode).stop();
      } catch {}
      try {
        n.disconnect();
      } catch {}
    });
    if (oldSrc) {
      try {
        oldSrc.stop();
      } catch {}
    }
  }, 1500);
}
