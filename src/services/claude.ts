import { SessionConfig } from '../data';

/**
 * Real LLM script generation via the Claude API.
 * Configure EXPO_PUBLIC_ANTHROPIC_API_KEY (e.g. in a .env file) to enable it;
 * without a key the app transparently falls back to the local demo generator.
 *
 * NOTE for production: route this call through your own backend instead of
 * shipping the API key inside the app binary.
 */

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

export function hasClaudeKey(): boolean {
  return typeof API_KEY === 'string' && API_KEY.length > 0;
}

export async function generateScriptWithClaude(
  config: SessionConfig
): Promise<{ title: string; lines: string[] }> {
  const langName = config.language === 'es' ? 'Spanish' : 'English';
  const prompt = `You are a meditation guide for the app "Keiro" (Japanese for "path/way"). Write a guided meditation in ${langName}.

Context:
- The listener wants to work on: ${config.mood}
- Time of day: ${config.moment}
- Duration: ${config.durationMin} minutes (write ${config.durationMin >= 10 ? '12-16' : '8-10'} short paragraphs; silence fills the gaps)
- Voice energy: ${config.energy}

Style: minimalist, warm, human, second person, present tense. Weave in — subtly, never heavy-handed — the metaphor of walking a path (sendero) toward one's inner calm, step by step. No lists, no headers.

Respond with JSON only: {"title": "...", "lines": ["...", "..."]}. The title is short and evocative (3-5 words).`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY!,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API error ${res.status}`);
  const data = await res.json();
  const text: string = data.content?.[0]?.text ?? '';
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const parsed = JSON.parse(json);
  if (!parsed.title || !Array.isArray(parsed.lines)) throw new Error('Bad script payload');
  return parsed;
}
