/* Pre-generates meditations with the expressive Eleven v3 model.
 *
 *   ELEVENLABS_API_KEY=sk_xxx node scripts/gen-meditations.mjs
 *
 * Each line is synthesized separately with v3 audio tags ([calmly], [softly],
 * [whispers]…) for a slow, warm delivery, then stitched together with ffmpeg
 * inserting a long silence between phrases. This gives exact control over the
 * meditation pacing (the calm comes from the silences, not from slowing the
 * voice) and exact per-line timings — independent of v3's tag behaviour.
 *
 * Output: assets/meditations/<id>.mp3 + assets/meditations/catalog.json,
 * consumed by src/prebuilt.ts. ffmpeg/ffprobe must be on PATH (they are on the
 * GitHub Actions ubuntu runner).
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'assets', 'meditations');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'keiro-'));

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Falta ELEVENLABS_API_KEY. Uso: ELEVENLABS_API_KEY=sk_xxx node scripts/gen-meditations.mjs');
  process.exit(1);
}

// Castilian (Spain) voices chosen from the shared library.
const VOICES = {
  belen: { id: 'KDG2CWzkFgcZz4Vqbu8m', gender: 'female', name: 'Belén' },
  victor: { id: 'Ypjv4S8CWJLMvXfBMUtN', gender: 'male', name: 'Víctor' },
};

// v3 "Natural" stability keeps the voice steady while still honouring the tags.
const VOICE_SETTINGS = { stability: 0.5, similarity_boost: 0.8, use_speaker_boost: true };

// Pacing, in seconds.
const LEAD_IN = 1.5; // silence before the first words
const GAP = 4.5; // silence between phrases
const TAIL = 4.0; // silence after the last phrase

const MEDITATIONS = [
  {
    id: 'calm-belen-es',
    voice: 'belen',
    mood: 'calm',
    lang: 'es',
    title: { es: 'Agua fresca', en: 'Cool water' },
    lines: [
      '[calmly] Bienvenida a este momento. Aquí no hay prisa… ni nada que resolver.',
      '[softly] Cierra los ojos, si te apetece… y deja que el cuerpo se asiente donde está.',
      '[calmly] Respira hondo por la nariz… y suelta el aire muy despacio.',
      '[gently] Con cada exhalación… el suelo te sostiene un poco más.',
      '[serene] La calma no se busca… se recuerda. Ya vive en ti, esperando.',
      '[softly] Saborea este silencio… como quien bebe agua fresca en mitad del camino.',
      '[calmly] No tienes que ir a ninguna parte. Ya estás aquí… y aquí es suficiente.',
      '[gently] Deja que la quietud se extienda, suave… desde el pecho hasta las manos.',
      '[whispers] Cuando quieras, vuelve poco a poco… lleva esta calma contigo.',
    ],
  },
  {
    id: 'calm-victor-es',
    voice: 'victor',
    mood: 'calm',
    lang: 'es',
    title: { es: 'El camino sereno', en: 'The serene path' },
    lines: [
      '[calmly] Detente un momento. El camino puede esperar.',
      '[serene] Siente el peso de tu cuerpo… sostenido, sin esfuerzo.',
      '[calmly] Toma aire profundamente… siente cómo se expande tu pecho… y exhala.',
      '[gently] No hay nada que perseguir en este instante… solo respirar.',
      '[serene] Imagina un sendero que se abre ante ti… tranquilo, sin final a la vista.',
      '[calmly] Cada respiración es un paso más… hacia tu propia calma.',
      '[softly] Suelta los hombros… afloja la mandíbula… deja caer lo que pesa.',
      '[gently] Aquí, en este silencio… no falta nada.',
      '[whispers] Poco a poco, regresa… el sendero seguirá aquí, siempre que lo necesites.',
    ],
  },
];

/** Remove the [audio tags] for the on-screen text. */
function clean(text) {
  return text.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
}

/** One v3 line → mp3 file. Returns the path. */
async function synthLine(voiceId, text, file) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'xi-api-key': API_KEY },
    body: JSON.stringify({ text, model_id: 'eleven_v3', voice_settings: VOICE_SETTINGS }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(file, buf);
  return file;
}

const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);
function duration(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return parseFloat(out.toString().trim());
}

/** A normalized silence clip of `sec` seconds. */
function silence(sec, file) {
  ff(['-f', 'lavfi', '-i', `anullsrc=r=44100:cl=mono`, '-t', String(sec), '-c:a', 'libmp3lame', '-b:a', '128k', file]);
  return file;
}

/** Normalize a spoken clip to 44100/mono/128k and soften its edges: a tiny
 * fade-in and a longer fade-out so phrase endings never cut abruptly. The
 * end fade is done with reverse→fade-in→reverse so we don't need the length. */
function normalize(input, file) {
  ff([
    '-i', input,
    '-af', 'afade=t=in:d=0.04,areverse,afade=t=in:d=0.28,areverse',
    '-ar', '44100', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '128k', file,
  ]);
  return file;
}

async function build(m) {
  const v = VOICES[m.voice];
  const segments = []; // { file, isSpeech, lineIndex }
  const lead = silence(LEAD_IN, path.join(TMP, `${m.id}-lead.mp3`));
  segments.push({ file: lead });

  for (let i = 0; i < m.lines.length; i++) {
    process.stdout.write(`  línea ${i + 1}/${m.lines.length}… `);
    const raw = await synthLine(v.id, m.lines[i], path.join(TMP, `${m.id}-${i}-raw.mp3`));
    const norm = normalize(raw, path.join(TMP, `${m.id}-${i}.mp3`));
    segments.push({ file: norm, isSpeech: true, lineIndex: i });
    console.log('ok');
    const gap = i === m.lines.length - 1 ? TAIL : GAP;
    segments.push({ file: silence(gap, path.join(TMP, `${m.id}-gap-${i}.mp3`)) });
  }

  // exact line start times from cumulative segment durations
  let t = 0;
  const lineAt = [];
  for (const seg of segments) {
    if (seg.isSpeech) lineAt[seg.lineIndex] = Math.round(t);
    t += duration(seg.file);
  }

  // concat, re-encoding the whole thing (NOT -c copy): joining separate mp3
  // streams with copy glitches at every boundary — that was the "clicking".
  const listFile = path.join(TMP, `${m.id}-list.txt`);
  fs.writeFileSync(listFile, segments.map((s) => `file '${s.file}'`).join('\n'));
  const outFile = path.join(OUT_DIR, `${m.id}.mp3`);
  ff(['-f', 'concat', '-safe', '0', '-i', listFile, '-ar', '44100', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '128k', outFile]);

  return {
    id: m.id,
    voice: m.voice,
    voiceName: v.name,
    gender: v.gender,
    mood: m.mood,
    lang: m.lang,
    title: m.title,
    durationSec: Math.ceil(t),
    file: `${m.id}.mp3`,
    lines: m.lines.map((text, i) => ({ at: lineAt[i], text: clean(text) })),
  };
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const catalog = [];
  for (const m of MEDITATIONS) {
    console.log(`Generando ${m.id} (${m.voice})…`);
    const entry = await build(m);
    catalog.push(entry);
    console.log(`  → ${entry.durationSec}s · ${entry.lines.length} líneas\n`);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'catalog.json'), JSON.stringify(catalog, null, 2));
  console.log(`Listo. ${catalog.length} meditaciones en assets/meditations/`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
