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

export interface SoundscapeMix {
  layers: { key: string; enabled: boolean; volume: number }[];
  hzFreq: number | null;
  hzVol: number;
  master: number;
}

export function getMix(): SoundscapeMix {
  return {
    layers: [...layers.values()].map((l) => ({ key: l.key, enabled: l.enabled, volume: l.volume })),
    hzFreq,
    hzVol,
    master: masterVol,
  };
}
