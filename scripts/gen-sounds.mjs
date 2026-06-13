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
  { key: 'wind', name: { es: 'Viento', en: 'Wind' }, query: 'calm wind breeze trees', tint: '#cfd8f4' },
  { key: 'waves', name: { es: 'Olas', en: 'Waves' }, query: 'ocean waves calm beach', tint: '#73bdb4' },
  { key: 'rain', name: { es: 'Lluvia', en: 'Rain' }, query: 'gentle rain steady soft', tint: '#a18ae6' },
];

const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);
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

/** Decode tolerantly into a clean wav so the loop step never trips on bad frames. */
function toCleanWav(src, out) {
  ff(['-err_detect', 'ignore_err', '-fflags', '+discardcorrupt', '-i', src, '-ac', '2', '-ar', '44100', out]);
  return out;
}

/** Make a seamless loop: rotate by CROSS and crossfade the wrap. */
function seamlessLoop(src, out) {
  const clean = toCleanWav(src, path.join(TMP, 'clean.wav'));
  const total = dur(clean);
  if (!(total > CROSS + 4)) throw new Error(`audio decodificado demasiado corto (${total}s)`);
  const window = Math.min(WINDOW, Math.max(8, total - 1));
  const start = Math.min(5, Math.max(0, total - window - 1)); // skip the first seconds
  const win = path.join(TMP, 'win.wav');
  ff(['-ss', String(start), '-t', String(window), '-i', clean, '-ac', '2', '-ar', '44100', win]);
  ff([
    '-i', win,
    '-filter_complex',
    `[0:a]asplit=2[h][t];[h]atrim=0:${CROSS},asetpts=N/SR/TB[a1];[t]atrim=${CROSS},asetpts=N/SR/TB[a2];[a2][a1]acrossfade=d=${CROSS}:c1=tri:c2=tri[out]`,
    '-map', '[out]', '-ac', '2', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '128k', out,
  ]);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const catalog = [];
  for (const s of SOUNDS) {
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
      const out = path.join(OUT_DIR, `${s.key}.mp3`);
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
    }
  }
  fs.writeFileSync(path.join(OUT_DIR, 'catalog.json'), JSON.stringify(catalog, null, 2));
  console.log(`\nListo. ${catalog.length} sonidos en assets/sounds/`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
