import { Platform } from 'react-native';
import { SOUNDS } from '../sounds';

/**
 * The ambient soundscape mixer (web, Web Audio API). Several looping layers —
 * water, wind, waves, rain — plus a pure solfeggio Hz tone, each with its own
 * gain, mixed live under the meditation voice. Loops are decoded into
 * AudioBuffers and played with loop=true for sample-accurate, gapless playback
 * (no click at the loop point). State is module-level so the mix survives the
 * player's re-renders; presets (future) just serialize getMix().
 */

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

type Layer = {
  key: string;
  uri: string;
  volume: number;
  enabled: boolean;
  buffer?: AudioBuffer;
  source?: AudioBufferSourceNode;
  gain?: GainNode;
  loading?: boolean;
};

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let masterVol = 1;
let running = false;

const layers = new Map<string, Layer>(
  // water on by default so a session always has a gentle bed; the rest off
  SOUNDS.map((s) => [s.key, { key: s.key, uri: s.uri, volume: 0.6, enabled: s.key === 'water' }])
);

// Hz solfeggio layer (synthesized, not a file)
let hz: { osc: OscillatorNode; gain: GainNode; freq: number } | null = null;
let hzFreq: number | null = null;
let hzVol = 0.5;

// "Aura": a synthesized warm melodic pad — a soft sustained chord that breathes.
// Infinite by nature, so it never has a loop seam. Lives alongside the file
// layers in the mixer.
let aura: { nodes: AudioNode[]; out: GainNode } | null = null;
let auraEnabled = false;
let auraVol = 0.6;

function audioCtx(): AudioContext | null {
  if (!isWeb) return null;
  const AC = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = masterVol;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

async function loadBuffer(layer: Layer): Promise<void> {
  if (layer.buffer || layer.loading || !layer.uri || !ctx) return;
  layer.loading = true;
  try {
    const res = await fetch(layer.uri);
    const arr = await res.arrayBuffer();
    layer.buffer = await ctx.decodeAudioData(arr);
  } catch {
    /* leave buffer undefined; layer just won't play */
  } finally {
    layer.loading = false;
  }
}

function startLayer(layer: Layer) {
  if (!ctx || !master || !layer.buffer || layer.source) return;
  const gain = ctx.createGain();
  gain.gain.value = layer.enabled ? layer.volume : 0;
  const src = ctx.createBufferSource();
  src.buffer = layer.buffer;
  src.loop = true;
  src.connect(gain);
  gain.connect(master);
  src.start();
  layer.source = src;
  layer.gain = gain;
}

function stopLayer(layer: Layer) {
  if (layer.source) {
    try {
      layer.source.stop();
    } catch {}
    layer.source.disconnect();
    layer.source = undefined;
  }
  if (layer.gain) {
    layer.gain.disconnect();
    layer.gain = undefined;
  }
}

/** Begin the soundscape: spin up enabled layers (loading buffers on demand). */
export async function startSoundscape(): Promise<void> {
  if (!audioCtx()) return;
  running = true;
  await Promise.all(
    [...layers.values()]
      .filter((l) => l.enabled)
      .map(async (l) => {
        await loadBuffer(l);
        if (running) startLayer(l);
      })
  );
  if (hzFreq != null) startHz();
  if (auraEnabled) startAura();
}

/** Toggle / set the volume of one ambient layer in real time. */
export async function setLayer(key: string, enabled: boolean, volume: number): Promise<void> {
  const layer = layers.get(key);
  if (!layer) return;
  layer.enabled = enabled;
  layer.volume = volume;
  if (!audioCtx() || !running) return;
  if (enabled) {
    await loadBuffer(layer);
    if (!layer.source) startLayer(layer);
    if (layer.gain && ctx) rampGain(layer.gain, volume, 0.3);
  } else if (layer.gain && ctx) {
    rampGain(layer.gain, 0, 0.4);
  }
}

function startHz() {
  if (!ctx || !master || hz || hzFreq == null) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = hzFreq;
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(master);
  osc.start();
  rampGain(gain, hzVol * 0.25, 1.2); // pure tones are piercing — keep them low
  hz = { osc, gain, freq: hzFreq };
}

/** Select a solfeggio frequency (or null to turn it off) and its volume. */
export function setHz(freq: number | null, volume: number): void {
  hzVol = volume;
  hzFreq = freq;
  if (!audioCtx() || !running) return;
  if (freq == null) {
    if (hz && ctx) {
      const old = hz;
      rampGain(old.gain, 0, 0.5);
      setTimeout(() => {
        try {
          old.osc.stop();
        } catch {}
        old.osc.disconnect();
        old.gain.disconnect();
      }, 700);
      hz = null;
    }
    return;
  }
  if (hz && hz.freq !== freq) {
    hz.osc.frequency.setTargetAtTime(freq, ctx!.currentTime, 0.1);
    hz.freq = freq;
  } else if (!hz) {
    startHz();
  }
  if (hz) rampGain(hz.gain, hzVol * 0.25, 0.3);
}

function startAura() {
  if (!ctx || !master || aura) return;
  const out = ctx.createGain();
  out.gain.value = 0;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  const breath = ctx.createGain();
  breath.gain.value = 1;
  // an open, suspended-feeling chord (root, fifth, octave, high fifth)
  const freqs = [130.81, 196.0, 261.63, 392.0];
  const nodes: AudioNode[] = freqs.map((f, i) => {
    const o = ctx!.createOscillator();
    o.type = i % 2 ? 'sine' : 'triangle';
    o.frequency.value = f;
    o.detune.value = (i - 1.5) * 4;
    o.connect(filter);
    o.start();
    return o;
  });
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 0.22;
  lfo.connect(lfoGain);
  lfoGain.connect(breath.gain);
  lfo.start();
  nodes.push(lfo);
  filter.connect(breath);
  breath.connect(out);
  out.connect(master);
  rampGain(out, auraVol * 0.18, 2);
  aura = { nodes, out };
}

function stopAura() {
  if (!aura) return;
  const a = aura;
  aura = null;
  rampGain(a.out, 0, 0.6);
  setTimeout(() => {
    a.nodes.forEach((n) => {
      try {
        (n as OscillatorNode).stop();
      } catch {}
    });
    a.out.disconnect();
  }, 800);
}

/** Toggle / set volume of the synthesized melodic pad. */
export function setAura(enabled: boolean, volume: number): void {
  auraVol = volume;
  auraEnabled = enabled;
  if (!audioCtx() || !running) return;
  if (enabled) {
    if (!aura) startAura();
    else if (aura) rampGain(aura.out, auraVol * 0.18, 0.3);
  } else {
    stopAura();
  }
}

function rampGain(g: GainNode, to: number, seconds: number) {
  if (!ctx) return;
  const p = g.gain as AudioParam & { cancelAndHoldAtTime?: (t: number) => void };
  if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(ctx.currentTime);
  else {
    p.cancelScheduledValues(ctx.currentTime);
    p.setValueAtTime(p.value, ctx.currentTime);
  }
  p.setTargetAtTime(to, ctx.currentTime, Math.max(0.05, seconds / 3));
}

/** 0..1 master volume over the whole soundscape. */
export function setSoundscapeVolume(v: number): void {
  masterVol = Math.max(0, Math.min(1, v));
  if (master && ctx) rampGain(master, masterVol, 0.15);
}

/** Gentle fade for the end of a session. */
export function fadeOutSoundscape(seconds = 6): void {
  if (master && ctx) rampGain(master, 0.0001, seconds);
}

export function stopSoundscape(): void {
  running = false;
  layers.forEach(stopLayer);
  stopAura();
  if (hz) {
    const old = hz;
    try {
      old.osc.stop();
    } catch {}
    old.osc.disconnect();
    old.gain.disconnect();
    hz = null;
  }
  if (master && ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.value = masterVol;
  }
}

/** A struck singing-bowl / gong — the start and end signal of a meditation.
 * Inharmonic partials, soft mallet attack, long decay, plus a faintly detuned
 * twin for the shimmer/beating. Routed to the output so it rings regardless of
 * the music volume. */
export function playBell(): void {
  const ac = audioCtx();
  if (!ac) return;
  const now = ac.currentTime + 0.02;
  const out = ac.createGain();
  out.connect(ac.destination);
  const base = 174;
  [
    { f: base, g: 1 },
    { f: base * 2.76, g: 0.5 },
    { f: base * 5.4, g: 0.22 },
    { f: base * 1.005, g: 0.7 },
  ].forEach((p) => {
    const o = ac.createOscillator();
    o.type = 'sine';
    o.frequency.value = p.f;
    const g = ac.createGain();
    g.gain.value = p.g;
    o.connect(g);
    g.connect(out);
    o.start(now);
    o.stop(now + 8);
  });
  out.gain.setValueAtTime(0.0001, now);
  out.gain.linearRampToValueAtTime(0.5, now + 0.06);
  out.gain.exponentialRampToValueAtTime(0.0006, now + 7);
}

export interface SoundscapeMix {
  layers: { key: string; enabled: boolean; volume: number }[];
  hzFreq: number | null;
  hzVol: number;
  auraEnabled: boolean;
  auraVol: number;
  master: number;
}

export function getMix(): SoundscapeMix {
  return {
    layers: [...layers.values()].map((l) => ({ key: l.key, enabled: l.enabled, volume: l.volume })),
    hzFreq,
    hzVol,
    auraEnabled,
    auraVol,
    master: masterVol,
  };
}
