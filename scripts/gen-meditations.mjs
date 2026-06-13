/* Pre-generates a handful of meditations with real ElevenLabs voices.
 *
 *   ELEVENLABS_API_KEY=sk_xxx node scripts/gen-meditations.mjs
 *
 * For each entry it sends the curated script to ElevenLabs (with-timestamps),
 * writes an .mp3 into assets/meditations/, and records when every line is
 * actually spoken — so the on-screen text stays in sync with the real voice
 * instead of being spread evenly. The result is written to
 * assets/meditations/catalog.json, which src/prebuilt.ts consumes.
 *
 * Curated scripts keep cost to ElevenLabs only (no Claude call yet). This is
 * the n=2 seed of the pre-generated library: prove the voices sound right,
 * then scale the matrix later.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'assets', 'meditations');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Falta ELEVENLABS_API_KEY. Uso: ELEVENLABS_API_KEY=sk_xxx node scripts/gen-meditations.mjs');
  process.exit(1);
}

// ElevenLabs premade voices (must match src/data.ts).
const VOICES = {
  lua: { id: '21m00Tcm4TlvDq8ikWAM', gender: 'female' },
  mateo: { id: 'ErXwobaYiN019PkySvjV', gender: 'male' },
};

// "Serene" energy mapping, lifted from src/services/elevenlabs.ts.
const SERENE = { stability: 0.75, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true };

const MEDITATIONS = [
  {
    id: 'calm-lua-es',
    voice: 'lua',
    mood: 'calm',
    lang: 'es',
    title: { es: 'Agua fresca', en: 'Cool water' },
    lines: [
      'Bienvenida a este momento. Aquí no hay prisa, ni nada que resolver.',
      'Cierra los ojos, si te apetece, y deja que el cuerpo se asiente donde está.',
      'Respira hondo por la nariz… y suelta el aire muy despacio.',
      'Con cada exhalación, el suelo te sostiene un poco más.',
      'La calma no se busca: se recuerda. Ya vive en ti, esperando.',
      'Saborea este silencio como quien bebe agua fresca en mitad del camino.',
      'No tienes que ir a ninguna parte. Ya estás aquí, y aquí es suficiente.',
      'Deja que la quietud se extienda, suave, desde el pecho hasta las manos.',
      'Cuando quieras, vuelve poco a poco. Lleva esta calma contigo.',
    ],
  },
  {
    id: 'calm-mateo-es',
    voice: 'mateo',
    mood: 'calm',
    lang: 'es',
    title: { es: 'El camino sereno', en: 'The serene path' },
    lines: [
      'Detente un momento. El camino puede esperar.',
      'Siente el peso de tu cuerpo, sostenido, sin esfuerzo.',
      'Toma aire profundamente… siente cómo se expande tu pecho… y exhala.',
      'No hay nada que perseguir en este instante. Solo respirar.',
      'Imagina un sendero que se abre ante ti, tranquilo, sin final a la vista.',
      'Cada respiración es un paso más hacia tu propia calma.',
      'Suelta los hombros. Afloja la mandíbula. Deja caer lo que pesa.',
      'Aquí, en este silencio, no falta nada.',
      'Poco a poco, regresa. El sendero seguirá aquí, siempre que lo necesites.',
    ],
  },
];

const BREAK = ' <break time="2.8s" /> ';

/** Find the spoken start time (seconds) of each line from the char alignment. */
function lineStartTimes(lines, alignment) {
  if (!alignment) return null;
  const chars = alignment.characters || [];
  const starts = alignment.character_start_times_seconds || [];
  const norm = (s) => s.toLowerCase().replace(/[^a-záéíóúñü0-9]/gi, '');

  // normalized stream + map back to original char index
  let normStream = '';
  const idxMap = [];
  for (let i = 0; i < chars.length; i++) {
    const n = norm(chars[i]);
    if (n) { normStream += n; for (let k = 0; k < n.length; k++) idxMap.push(i); }
  }

  let from = 0;
  const ats = [];
  for (const line of lines) {
    const key = norm(line).slice(0, 14);
    const pos = key ? normStream.indexOf(key, from) : -1;
    if (pos >= 0) {
      ats.push(Math.max(0, Math.round(starts[idxMap[pos]] || 0)));
      from = pos + key.length;
    } else {
      ats.push(ats.length ? ats[ats.length - 1] + 3 : 0);
    }
  }
  return ats;
}

async function synth(m) {
  const v = VOICES[m.voice];
  const text = m.lines.join(BREAK);
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${v.id}/with-timestamps?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'xi-api-key': API_KEY },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: SERENE }),
  });
  if (!res.ok) throw new Error(`${m.id}: ElevenLabs ${res.status} ${await res.text()}`);
  const data = await res.json();

  const mp3 = Buffer.from(data.audio_base64, 'base64');
  fs.writeFileSync(path.join(OUT_DIR, `${m.id}.mp3`), mp3);

  const align = data.normalized_alignment || data.alignment;
  const ats = lineStartTimes(m.lines, align);
  const endTimes = align?.character_end_times_seconds;
  const durationSec = endTimes?.length ? Math.ceil(endTimes[endTimes.length - 1] + 4) : m.lines.length * 18;

  return {
    id: m.id,
    voice: m.voice,
    gender: v.gender,
    mood: m.mood,
    lang: m.lang,
    title: m.title,
    durationSec,
    file: `${m.id}.mp3`,
    lines: m.lines.map((text, i) => ({ at: ats ? ats[i] : i * 18, text })),
  };
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const catalog = [];
  for (const m of MEDITATIONS) {
    process.stdout.write(`Generando ${m.id} (${m.voice})… `);
    const entry = await synth(m);
    catalog.push(entry);
    console.log(`ok · ${entry.durationSec}s · ${entry.lines.length} líneas`);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'catalog.json'), JSON.stringify(catalog, null, 2));
  console.log(`\nListo. ${catalog.length} meditaciones en assets/meditations/`);
})().catch((e) => { console.error(e); process.exit(1); });
