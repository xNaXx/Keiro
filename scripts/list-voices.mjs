/* Lists Spanish (Spain) voices from the ElevenLabs shared voice library so we
 * can pick a calm female + male with a Castilian accent.
 *
 *   ELEVENLABS_API_KEY=sk_xxx node scripts/list-voices.mjs
 */
const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('Falta ELEVENLABS_API_KEY');
  process.exit(1);
}

async function fetchVoices(gender) {
  const url = `https://api.elevenlabs.io/v1/shared-voices?page_size=100&language=es&gender=${gender}`;
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
  const spain = voices.filter(isSpain);
  const list = spain.slice(0, 15);
  console.log(`\n===== ${g.toUpperCase()} · ${spain.length} de España (de ${voices.length} en español) =====`);
  for (const v of list) {
    console.log(`- ${v.name}  |  accent=${v.accent || '?'}  |  id=${v.voice_id}`);
    console.log(`    preview: ${v.preview_url}`);
    if (v.description) console.log(`    ${String(v.description).replace(/\s+/g, ' ').slice(0, 100)}`);
  }
}
