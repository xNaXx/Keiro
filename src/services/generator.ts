import { Language } from '../i18n';
import { Meditation, MeditationLine, SessionConfig } from '../data';
import { generateScriptWithClaude, hasClaudeKey } from './claude';

/**
 * Demo phrase banks. Each generation samples randomly from these pools so
 * no two meditations come out the same — mirroring what the real LLM
 * integration does once an API key is configured.
 */

type Bank = { es: string[]; en: string[] };

const OPENINGS: Bank = {
  es: [
    'Bienvenida a este momento. Aquí no hay prisa.',
    'Llega tal y como estás. Eso es suficiente.',
    'Este instante es tuyo. Nadie más lo habita.',
    'Detente un momento. El camino puede esperar.',
    'Respira. Acabas de dar el primer paso.',
  ],
  en: [
    'Welcome to this moment. There is no hurry here.',
    'Arrive just as you are. That is enough.',
    'This moment is yours. No one else lives in it.',
    'Pause for a moment. The road can wait.',
    'Breathe. You have just taken the first step.',
  ],
};

const BREATHING: Bank = {
  es: [
    'Inhala lentamente por la nariz… y suelta el aire muy despacio.',
    'Toma aire profundamente… siente cómo se expande tu pecho… y exhala.',
    'Respira hondo. Con cada exhalación, el suelo te sostiene un poco más.',
    'Deja que la respiración encuentre su propio ritmo, sin forzar nada.',
    'Inhala calma… exhala lo que ya no necesitas llevar contigo.',
  ],
  en: [
    'Breathe in slowly through your nose… and let the air go, very gently.',
    'Take a deep breath… feel your chest expand… and release.',
    'Breathe deeply. With every exhale, the ground holds you a little more.',
    'Let your breath find its own rhythm, forcing nothing.',
    'Breathe in calm… breathe out what you no longer need to carry.',
  ],
};

const BODY: Bank = {
  es: [
    'Recorre tu cuerpo con atención amable, desde la frente hasta los pies.',
    'Suelta los hombros. Afloja la mandíbula. Deja caer el peso.',
    'Siente los puntos donde tu cuerpo toca el mundo. Ahí estás a salvo.',
    'Nota el aire en la piel, la temperatura, el leve latido en las manos.',
  ],
  en: [
    'Travel through your body with kind attention, from brow to feet.',
    'Drop your shoulders. Soften your jaw. Let the weight fall away.',
    'Feel the points where your body touches the world. There, you are safe.',
    'Notice the air on your skin, the temperature, the faint pulse in your hands.',
  ],
};

const MOOD_LINES: Record<string, Bank> = {
  anxiety: {
    es: [
      'La ansiedad es una ola: no luches contra ella, déjala pasar a través de ti.',
      'No tienes que resolverlo todo ahora. Solo este paso. Solo esta respiración.',
      'Imagina que tus pensamientos son nubes. Tú eres el cielo que las mira pasar.',
      'Tu mente corre hacia el futuro. Tráela de vuelta, con suavidad, a este paso del camino.',
    ],
    en: [
      'Anxiety is a wave: do not fight it, let it pass through you.',
      'You do not have to solve everything now. Just this step. Just this breath.',
      'Imagine your thoughts as clouds. You are the sky watching them drift by.',
      'Your mind races toward the future. Gently bring it back to this step of the path.',
    ],
  },
  sadness: {
    es: [
      'La tristeza también merece un lugar. Déjala sentarse a tu lado, sin juicio.',
      'No hay nada roto en ti. Hay algo que pide ser escuchado.',
      'Como la lluvia, la tristeza riega lugares que no sabías que existían.',
      'Permítete sentir. Las lágrimas también son parte del sendero.',
    ],
    en: [
      'Sadness deserves a place too. Let it sit beside you, without judgment.',
      'Nothing in you is broken. Something is asking to be heard.',
      'Like rain, sadness waters places you did not know existed.',
      'Allow yourself to feel. Tears are part of the path as well.',
    ],
  },
  worry: {
    es: [
      'La preocupación habla del mañana. Tú estás aquí, en el hoy.',
      'Pregúntate con cariño: ¿qué puedo soltar en este momento?',
      'Cada preocupación es una piedra en la mochila. Deja una en el borde del camino.',
      'El futuro se camina paso a paso, no de un salto.',
    ],
    en: [
      'Worry speaks of tomorrow. You are here, in today.',
      'Ask yourself kindly: what can I set down right now?',
      'Every worry is a stone in your pack. Leave one by the side of the road.',
      'The future is walked step by step, not in a single leap.',
    ],
  },
  stress: {
    es: [
      'Tu cuerpo ha estado en tensión, defendiéndote. Dale las gracias y permiso para aflojar.',
      'Nada de lo que te exige el mundo es más urgente que este minuto de paz.',
      'Imagina que el estrés se disuelve con cada exhalación, como niebla al sol.',
      'No eres tu lista de tareas. Eres quien camina, no la carga.',
    ],
    en: [
      'Your body has been tense, protecting you. Thank it, and give it permission to soften.',
      'Nothing the world demands is more urgent than this minute of peace.',
      'Imagine stress dissolving with every exhale, like mist in the sun.',
      'You are not your to-do list. You are the walker, not the load.',
    ],
  },
  insomnia: {
    es: [
      'No persigas el sueño. Prepara el lugar y deja que llegue solo.',
      'Tu único trabajo ahora es descansar. Dormir es un regalo que viene después.',
      'Siente cómo la noche te envuelve, suave como una manta.',
      'Con cada respiración, tu cuerpo pesa un poco más sobre la cama.',
    ],
    en: [
      'Do not chase sleep. Prepare the place and let it arrive on its own.',
      'Your only task now is to rest. Sleep is a gift that follows.',
      'Feel the night wrap around you, soft as a blanket.',
      'With every breath, your body grows a little heavier on the bed.',
    ],
  },
  calm: {
    es: [
      'Ya estás en calma. Esto solo es un lugar para profundizarla.',
      'Saborea este silencio como quien bebe agua fresca en mitad del camino.',
      'La serenidad no se busca: se recuerda. Ya vive en ti.',
    ],
    en: [
      'You are already calm. This is simply a place to deepen it.',
      'Savor this silence like cool water in the middle of the road.',
      'Serenity is not found: it is remembered. It already lives in you.',
    ],
  },
  gratitude: {
    es: [
      'Trae a tu mente algo pequeño y bueno de hoy. Sostenlo un instante.',
      'La gratitud es mirar el mismo camino con otros ojos.',
      'Da las gracias a tu cuerpo, que te ha traído hasta aquí.',
    ],
    en: [
      'Bring to mind one small good thing from today. Hold it for a moment.',
      'Gratitude is seeing the same road with different eyes.',
      'Thank your body, which has carried you all the way here.',
    ],
  },
  focus: {
    es: [
      'Reúne tu atención como quien recoge agua entre las manos.',
      'Una sola cosa a la vez. Un solo paso a la vez.',
      'Cuando la mente se disperse, vuelve al ancla de la respiración.',
    ],
    en: [
      'Gather your attention like water cupped in your hands.',
      'One thing at a time. One step at a time.',
      'When the mind scatters, return to the anchor of your breath.',
    ],
  },
};

const PATH_LINES: Bank = {
  es: [
    'Imagina un sendero que se abre delante de ti. No ves el final, y no hace falta.',
    'Cada meditación es un paso más en el camino hacia tu mundo interior.',
    'El sendero no se descubre mirando el mapa, sino caminándolo.',
    'Mira atrás un instante: cuánto camino has recorrido ya.',
  ],
  en: [
    'Imagine a path opening before you. You cannot see the end, and you do not need to.',
    'Each meditation is one more step on the way to your inner world.',
    'The path is not discovered by reading the map, but by walking it.',
    'Glance back for a moment: see how far you have already come.',
  ],
};

const CLOSINGS: Bank = {
  es: [
    'Poco a poco, vuelve a sentir la habitación a tu alrededor. Abre los ojos cuando quieras.',
    'Lleva contigo esta calma. El sendero seguirá aquí mañana.',
    'Has dado un paso más. Gracias por caminar contigo.',
  ],
  en: [
    'Slowly, feel the room around you again. Open your eyes whenever you wish.',
    'Carry this calm with you. The path will still be here tomorrow.',
    'You have taken one more step. Thank you for walking with yourself.',
  ],
};

const TITLES: Record<string, Bank> = {
  anxiety: { es: ['Donde la ola se calma', 'Aire para la mente'], en: ['Where the wave settles', 'Air for the mind'] },
  sadness: { es: ['Lluvia que riega', 'Un lugar para la tristeza'], en: ['Rain that waters', 'A place for sadness'] },
  worry: { es: ['Piedras en el borde', 'Soltar el mañana'], en: ['Stones by the roadside', 'Letting go of tomorrow'] },
  stress: { es: ['Niebla al sol', 'Permiso para aflojar'], en: ['Mist in the sun', 'Permission to soften'] },
  insomnia: { es: ['La noche te sostiene', 'Camino al descanso'], en: ['Held by the night', 'The way to rest'] },
  calm: { es: ['Agua fresca', 'La calma recordada'], en: ['Cool water', 'Calm, remembered'] },
  gratitude: { es: ['Otros ojos', 'Lo pequeño y bueno'], en: ['Different eyes', 'The small good things'] },
  focus: { es: ['Un solo paso', 'El ancla'], en: ['A single step', 'The anchor'] },
};

function pick<T>(arr: T[], n: number, rng: () => number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  return out;
}

function buildDemoScript(config: SessionConfig): { title: string; texts: string[] } {
  const rng = Math.random;
  const lang: Language = config.language;
  const mood = MOOD_LINES[config.mood] ?? MOOD_LINES.calm;
  const long = config.durationMin >= 10;
  // density: how much of the session the voice fills vs. leaves to silence
  const d = config.density === 'low' ? 0 : config.density === 'high' ? 2 : 1;

  const texts = [
    ...pick(OPENINGS[lang], 1, rng),
    ...pick(BREATHING[lang], (long ? 2 : 1) + (d === 2 ? 1 : 0), rng),
    ...pick(BODY[lang], d === 0 ? 1 : (long ? 2 : 1) + (d === 2 ? 1 : 0), rng),
    ...pick(mood[lang], (d === 0 ? 1 : long ? 3 : 2) + (d === 2 ? 1 : 0), rng),
    ...pick(PATH_LINES[lang], d === 0 ? 1 : d === 2 ? 2 : 1, rng),
    ...pick(mood[lang === 'es' ? 'es' : 'en'].slice().reverse(), long && d > 0 ? 1 : 0, rng),
    ...pick(CLOSINGS[lang], 1, rng),
  ];
  const titleBank = TITLES[config.mood] ?? TITLES.calm;
  const title = pick(titleBank[lang], 1, rng)[0];
  return { title, texts };
}

/** Spread lines across the duration, leaving silence between them. */
function timeline(texts: string[], durationSec: number): MeditationLine[] {
  const intro = 6;
  const outroGap = Math.min(30, durationSec * 0.12);
  const usable = durationSec - intro - outroGap;
  const step = usable / Math.max(texts.length - 1, 1);
  return texts.map((text, i) => ({ at: Math.round(intro + i * step), text }));
}

/** Seconds of silence between lines for each voice pace. */
const DENSITY_INTERVAL = { low: 50, medium: 28, high: 14 } as const;

/**
 * Fit the script to the chosen pace: a 'high' session speaks every ~14s,
 * 'low' leaves long silences. Extra lines are drawn from the banks
 * (avoiding immediate repeats) when the base script runs short.
 */
function fitToDensity(texts: string[], config: SessionConfig): string[] {
  const interval = DENSITY_INTERVAL[config.density] ?? DENSITY_INTERVAL.medium;
  const usable = config.durationMin * 60 - 36;
  const target = Math.max(5, Math.round(usable / interval));

  if (texts.length >= target) {
    // keep opening and closing, thin out the middle evenly
    const middle = texts.slice(1, -1);
    const keep = Math.max(target - 2, 1);
    const out: string[] = [texts[0]];
    for (let i = 0; i < keep; i++) out.push(middle[Math.floor((i * middle.length) / keep)]);
    out.push(texts[texts.length - 1]);
    return out;
  }

  const lang = config.language;
  const mood = MOOD_LINES[config.mood] ?? MOOD_LINES.calm;
  const pool = [...mood[lang], ...BREATHING[lang], ...BODY[lang], ...PATH_LINES[lang]];
  const closing = texts[texts.length - 1];
  const out = texts.slice(0, -1);
  let guard = 0;
  while (out.length < target - 1 && guard++ < 200) {
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    if (candidate !== out[out.length - 1]) out.push(candidate);
  }
  out.push(closing);
  return out;
}

export async function generateMeditation(config: SessionConfig): Promise<Meditation> {
  let title: string;
  let texts: string[];

  if (hasClaudeKey()) {
    try {
      const res = await generateScriptWithClaude(config);
      title = res.title;
      texts = res.lines;
    } catch {
      ({ title, texts } = buildDemoScript(config));
    }
  } else {
    ({ title, texts } = buildDemoScript(config));
  }

  // organic duration: ±10s around the nominal time, never a hard cut
  const jitter = Math.round((Math.random() * 2 - 1) * 10);
  const durationSec = config.durationMin * 60 + jitter;
  return {
    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    title,
    config,
    lines: timeline(fitToDensity(texts, config), durationSec),
    durationSec,
    createdAt: Date.now(),
    downloaded: false,
  };
}
