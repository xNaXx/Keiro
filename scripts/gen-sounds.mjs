/* Downloads CC0 ambient loops from Freesound and turns each into a seamless
 * loop (no audible click at the loop point) with ffmpeg.
 *
 *   FREESOUND_API_KEY=xxx node scripts/gen-sounds.mjs
 *
 * Seamless-loop trick: rotate the clip by `d` seconds and crossfade the wrap,
 * so the start and end meet at the same source instant — the loop point
 * becomes inaudible. Output: assets/sounds/<key>.mp3 + assets/sounds/catalog.json
 * (consumed by the soundscape mixer). ffmpeg/ffprobe must be on PATH.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'keiro-snd-'));

const API_KEY = process.env.FREESOUND_API_KEY;
if (!API_KEY) {
  console.error('Falta FREESOUND_API_KEY. Uso: FREESOUND_API_KEY=xxx node scripts/gen-sounds.mjs');
  process.exit(1);
}

const WINDOW = 24; // seconds of source material to take
const CROSS = 4; // crossfade seconds at the loop seam (final loop ≈ WINDOW - CROSS)

// What we want, with search queries. tint matches the app palette accents.
const SOUNDS = [
  { key: 'water', name: { es: 'Agua', en: 'Water' }, query: 'water stream flowing gentle', tint: '#8fb4ef' },
  { key: 'rain', name: { es: 'Lluvia', en: 'Rain' }, query: 'gentle rain steady soft', tint: '#7fa8d8' },
  { key: 'waves', name: { es: 'Olas', en: 'Waves' }, query: 'ocean waves calm beach', tint: '#73bdb4' },
  { key: 'wind', name: { es: 'Viento', en: 'Wind' }, query: 'calm wind breeze trees', tint: '#cfd8f4' },
  { key: 'fire', name: { es: 'Fuego', en: 'Fire' }, query: 'fire crackling campfire loop', tint: '#e8842c' },
  { key: 'bowls', name: { es: 'Cuencos', en: 'Bowls' }, query: 'tibetan singing bowl resonance drone', tint: '#e8c531' },
  { key: 'pad', name: { es: 'Aura', en: 'Pad' }, query: 'warm ambient music pad soft texture loop calm', tint: '#a18ae6' },
  { key: 'drone', name: { es: 'Drone', en: 'Drone' }, query: 'meditation ambient drone harmonic soft sustained', tint: '#b56fa8' },
  { key: 'chimes', name: { es: 'Campanas', en: 'Chimes' }, query: 'wind chimes gentle soft', tint: '#67d4b8' },
];

// Keys whose existing file should be regenerated even if present.
const FORCE = new Set(['pad']);

const ff = (args) => execFileSync('ffmpeg', ['-y', '-hide_banner', ...args], { stdio: ['ignore', 'pipe', 'inherit'] });
function dur(file) {
  return parseFloat(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim()
  );
}

async function search(query) {
  const filter = 'license:"Creative Commons 0" duration:[20 TO 200]';
  const url =
    'https://freesound.org/apiv2/search/text/?' +
    new URLSearchParams({
      query,
      filter,
      fields: 'id,name,username,license,duration,previews',
      sort: 'rating_desc',
      page_size: '15',
    });
  const res = await fetch(url, { headers: { Authorization: `Token ${API_KEY}` } });
  if (!res.ok) throw new Error(`Freesound search ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.results || [];
}

async function download(previewUrl, file) {
  // previews are public CDN files — no auth header (it can break the response)
  const res = await fetch(previewUrl);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(file, buf);
  console.log(`(${(buf.length / 1024).toFixed(0)} KB, ${res.headers.get('content-type')})`);
  return file;
}

/** Make a seamless loop: take window [CROSS..WINDOW] and crossfade its end with
 * the source's first CROSS seconds, so the loop point lands on the same instant
 * and is inaudible. The source is decoded twice (two -i) instead of asplit —
 * acrossfade deadlocks ("no filtered frames") when both legs share one asplit. */
function seamlessLoop(src, out) {
  const tmpOut = path.join(TMP, 'loop.mp3');
  ff([
    '-i', src, '-i', src,
    '-filter_complex',
    `[0:a]atrim=${CROSS}:${WINDOW},asetpts=N/SR/TB[a2];` +
      `[1:a]atrim=0:${CROSS},asetpts=N/SR/TB[a1];` +
      `[a2][a1]acrossfade=d=${CROSS}:c1=tri:c2=tri[o]`,
    '-map', '[o]', '-ac', '2', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '128k', tmpOut,
  ]);
  const d = dur(tmpOut);
  if (!(d > 5)) throw new Error(`loop vacío (${d}s)`);
  fs.copyFileSync(tmpOut, out);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // keep entries for sounds we don't regenerate this run
  let existing = {};
  try {
    existing = Object.fromEntries(
      JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'catalog.json'), 'utf8')).map((e) => [e.key, e])
    );
  } catch {}

  const catalog = [];
  for (const s of SOUNDS) {
    const filePath = path.join(OUT_DIR, `${s.key}.mp3`);
    if (!FORCE.has(s.key) && fs.existsSync(filePath) && existing[s.key]) {
      catalog.push(existing[s.key]); // preserve a sound we already like
      console.log(`${s.key}: ya existe, conservado`);
      continue;
    }
    try {
      process.stdout.write(`${s.key}: buscando "${s.query}"… `);
      const results = await search(s.query);
      const pick = results.find(
        (r) => r.previews && (r.previews['preview-hq-ogg'] || r.previews['preview-hq-mp3']) && r.duration >= 20
      );
      if (!pick) {
        console.log('sin resultados CC0 utilizables, omitido');
        continue;
      }
      process.stdout.write(`#${pick.id} "${pick.name}" `);
      // OGG previews decode far more reliably in ffmpeg than the mp3 ones
      const previewUrl = pick.previews['preview-hq-ogg'] || pick.previews['preview-hq-mp3'];
      const ext = previewUrl.includes('.ogg') ? 'ogg' : 'mp3';
      const raw = path.join(TMP, `${s.key}-raw.${ext}`);
      await download(previewUrl, raw);
      const out = filePath;
      seamlessLoop(raw, out);
      catalog.push({
        key: s.key,
        name: s.name,
        tint: s.tint,
        file: `${s.key}.mp3`,
        loopSec: Math.round(dur(out)),
        source: { freesoundId: pick.id, title: pick.name, author: pick.username, license: 'CC0' },
      });
      console.log(`  ✓ loop ${Math.round(dur(out))}s por ${pick.username}`);
    } catch (e) {
      console.log(`  ✗ ${s.key} falló: ${e.message}`);
      if (existing[s.key]) catalog.push(existing[s.key]); // fall back to the old one
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, 'catalog.json'), JSON.stringify(catalog, null, 2));
  console.log(`\nListo. ${catalog.length} sonidos en assets/sounds/`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
