/* Lists voices from the ElevenLabs shared library for picking calm narrators.
 * Language via VLANG env ('es' default, or 'en'). For Spanish it favours a
 * Castilian (Spain) accent; for others it shows the top-rated with their accent.
 *
 *   VLANG=en ELEVENLABS_API_KEY=sk_xxx node scripts/list-voices.mjs
 */
const API_KEY = process.env.ELEVENLABS_API_KEY;
const LANG = process.env.VLANG || 'es';
if (!API_KEY) {
  console.error('Falta ELEVENLABS_API_KEY');
  process.exit(1);
}

async function fetchVoices(gender) {
  const url = `https://api.elevenlabs.io/v1/shared-voices?page_size=100&language=${LANG}&gender=${gender}`;
  const res = await fetch(url, { headers: { 'xi-api-key': API_KEY } });
  if (!res.ok) {
    console.error(gender, res.status, await res.text());
    return [];
  }
  const data = await res.json();
  return data.voices || [];
}

function isSpain(v) {
  const s = `${v.accent || ''} ${v.locale || ''} ${v.language || ''} ${v.description || ''}`.toLowerCase();
  return /castil|spain|españa|espana|peninsul|european spanish|spanish \(spain\)/.test(s);
}

for (const g of ['female', 'male']) {
  const voices = await fetchVoices(g);
  // for English just show top-rated (any accent); for Spanish prefer Spain
  const filtered = LANG === 'es' ? voices.filter(isSpain) : voices;
  const list = filtered.slice(0, 15);
  console.log(`\n===== ${g.toUpperCase()} · ${LANG} · ${filtered.length} (de ${voices.length}) =====`);
  for (const v of list) {
    console.log(`- ${v.name}  |  accent=${v.accent || '?'}  |  id=${v.voice_id}`);
    console.log(`    preview: ${v.preview_url}`);
    if (v.description) console.log(`    ${String(v.description).replace(/\s+/g, ' ').slice(0, 100)}`);
  }
}
