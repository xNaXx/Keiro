export type Language = 'es' | 'en';

type Dict = Record<string, { es: string; en: string }>;

const dict: Dict = {
  // generic
  continue: { es: 'Continuar', en: 'Continue' },
  back: { es: 'Volver', en: 'Back' },
  skip: { es: 'Saltar', en: 'Skip' },
  save: { es: 'Guardar', en: 'Save' },
  done: { es: 'Hecho', en: 'Done' },
  begin: { es: 'Comenzar', en: 'Begin' },

  // onboarding
  ob_tag: { es: 'sendero', en: 'path' },
  brand_tag: { es: 'meditation app', en: 'meditation app' },
  ob1_title: { es: 'Todo camino empieza\ncon un paso', en: 'Every path begins\nwith a single step' },
  ob1_body: { es: 'Keiro significa sendero: el camino que descubres a medida que lo recorres.', en: 'Keiro means path: the way you discover as you walk it.' },
  ob2_title: { es: 'Meditaciones que\nnacen para ti', en: 'Meditations born\njust for you' },
  ob2_body: { es: 'Cada sesión se genera en el momento, según cómo te sientes. Ninguna se repite.', en: 'Each session is generated in the moment, from how you feel. No two are alike.' },
  ob3_title: { es: 'Voces humanas,\ncalma real', en: 'Human voices,\nreal calm' },
  ob3_body: { es: 'Voces cálidas y cercanas te acompañan paso a paso hacia tu mundo interior.', en: 'Warm, close voices walk with you, step by step, into your inner world.' },

  // auth
  auth_welcome: { es: 'Bienvenido a tu sendero', en: 'Welcome to your path' },
  auth_login: { es: 'Iniciar sesión', en: 'Log in' },
  auth_register: { es: 'Crear cuenta', en: 'Create account' },
  auth_google: { es: 'Continuar con Google', en: 'Continue with Google' },
  auth_facebook: { es: 'Continuar con Facebook', en: 'Continue with Facebook' },
  auth_apple: { es: 'Continuar con Apple', en: 'Continue with Apple' },
  auth_or: { es: 'o con tu correo', en: 'or with your email' },
  auth_email: { es: 'Correo electrónico', en: 'Email' },
  auth_password: { es: 'Contraseña', en: 'Password' },
  auth_have_account: { es: '¿Ya tienes cuenta? Inicia sesión', en: 'Already have an account? Log in' },
  auth_no_account: { es: '¿No tienes cuenta? Regístrate', en: "Don't have an account? Sign up" },

  // profile setup
  setup_title: { es: 'Antes de dar el primer paso', en: 'Before your first step' },
  setup_body: { es: 'Cuéntanos un poco de ti para acompañarte mejor.', en: 'Tell us a little about yourself so we can walk with you.' },
  setup_name: { es: 'Tu nombre', en: 'Your name' },
  setup_age: { es: 'Tu edad (opcional)', en: 'Your age (optional)' },
  setup_photo: { es: 'Añadir foto', en: 'Add photo' },
  setup_change_photo: { es: 'Cambiar foto', en: 'Change photo' },
  setup_start: { es: 'Empezar mi sendero', en: 'Start my path' },

  // home
  hello: { es: 'Hola', en: 'Hey' },
  day_of_path: { es: 'Día {n} de tu sendero', en: 'Day {n} of your path' },
  how_feeling_morning: { es: '¿Cómo te sientes\nesta mañana?', en: 'How are you feeling\nthis morning?' },
  how_feeling_afternoon: { es: '¿Cómo te sientes\nesta tarde?', en: 'How are you feeling\nthis afternoon?' },
  how_feeling_night: { es: '¿Cómo te sientes\nesta noche?', en: 'How are you feeling\ntonight?' },
  new_session: { es: 'Nueva meditación', en: 'New meditation' },
  last_step: { es: 'Tu último paso', en: 'Your last step' },
  resume: { es: 'Repetir', en: 'Replay' },
  home_quote_1: { es: 'El sendero se hace al andar.', en: 'The path is made by walking.' },

  // tabs
  tab_home: { es: 'Inicio', en: 'Home' },
  tab_library: { es: 'Biblioteca', en: 'Library' },
  tab_profile: { es: 'Perfil', en: 'Profile' },

  // mode select
  mode_title: { es: '¿Cómo quieres\ncaminar hoy?', en: 'How would you like\nto walk today?' },
  mode_label: { es: 'modo', en: 'mode' },
  mode_simple: { es: 'Sencillo', en: 'Simple' },
  mode_simple_desc: { es: 'Elige qué te pesa y deja que Keiro trace el resto del camino.', en: 'Choose what weighs on you and let Keiro trace the rest of the way.' },
  mode_advanced: { es: 'Avanzado', en: 'Advanced' },
  mode_advanced_desc: { es: 'Decide cada detalle: voz, duración, energía y momento del día.', en: 'Shape every detail: voice, length, energy and time of day.' },

  // simple flow
  simple_title: { es: '¿Qué quieres soltar\nhoy?', en: 'What would you like\nto release today?' },
  mood_label: { es: 'mood', en: 'mood' },
  today_i_feel: { es: 'Hoy siento', en: 'Today I feel' },

  // advanced flow
  adv_step: { es: 'Paso {a} de {b}', en: 'Step {a} of {b}' },
  adv_mood_title: { es: '¿Qué te acompaña\nhoy?', en: 'What walks with\nyou today?' },
  adv_moment_title: { es: '¿En qué momento del\ndía estás?', en: 'Where in the day\nare you?' },
  adv_duration_title: { es: '¿Cuánto tiempo\ntienes para ti?', en: 'How much time do\nyou have for yourself?' },
  adv_voice_title: { es: '¿Qué voz quieres\na tu lado?', en: 'Whose voice would\nyou like beside you?' },
  adv_energy_title: { es: '¿Qué energía debe\ntener la voz?', en: 'What energy should\nthe voice carry?' },
  voice_label: { es: 'voz', en: 'voice' },
  moment_label: { es: 'momento', en: 'moment' },
  time_label: { es: 'tiempo', en: 'time' },
  energy_label: { es: 'energía', en: 'energy' },
  minutes: { es: 'min', en: 'min' },
  preview_voice: { es: 'Escuchar', en: 'Preview' },

  // moments of day
  moment_morning: { es: 'Mañana', en: 'Morning' },
  moment_midday: { es: 'Mediodía', en: 'Midday' },
  moment_evening: { es: 'Tarde', en: 'Evening' },
  moment_night: { es: 'Noche', en: 'Night' },

  // energies
  energy_whisper: { es: 'Susurro', en: 'Whisper' },
  energy_whisper_d: { es: 'Apenas una brisa', en: 'Barely a breeze' },
  energy_serene: { es: 'Serena', en: 'Serene' },
  energy_serene_d: { es: 'Calmada y constante', en: 'Calm and steady' },
  energy_warm: { es: 'Cálida', en: 'Warm' },
  energy_warm_d: { es: 'Cercana, como una amiga', en: 'Close, like a friend' },
  energy_bright: { es: 'Luminosa', en: 'Bright' },
  energy_bright_d: { es: 'Suave impulso vital', en: 'A gentle lift of life' },

  // sound step
  adv_sound_title: { es: '¿Qué sonido te\nacompaña?', en: 'What sound walks\nwith you?' },
  sound_label: { es: 'sonido', en: 'sound' },
  sound_ambient: { es: 'Ambiental', en: 'Ambient' },
  sound_ambient_d: { es: 'Texturas suaves y cálidas', en: 'Soft, warm textures' },
  sound_hz: { es: 'Frecuencias Hz', en: 'Hz frequencies' },
  sound_hz_d: { es: 'Tonos solfeggio puros', en: 'Pure solfeggio tones' },

  // voice density step
  adv_density_title: { es: '¿Cada cuánto quieres\noír la voz?', en: 'How often should\nthe voice speak?' },
  density_label: { es: 'ritmo', en: 'pace' },
  density_low: { es: 'Espaciada', en: 'Spacious' },
  density_low_d: { es: 'Mucho silencio entre frases', en: 'Long silences between phrases' },
  density_medium: { es: 'Equilibrada', en: 'Balanced' },
  density_medium_d: { es: 'Un punto medio sereno', en: 'A serene middle ground' },
  density_high: { es: 'Constante', en: 'Steady' },
  density_high_d: { es: 'Acompañamiento continuo', en: 'Continuous guidance' },

  // paywall
  pw_label: { es: 'premium', en: 'premium' },
  pw_title: { es: 'Tu calma,\nsin límites', en: 'Your calm,\nwithout limits' },
  pw_f1: { es: 'Meditaciones ilimitadas sin anuncios', en: 'Unlimited meditations, no ads' },
  pw_f2: { es: 'Todas las voces y frecuencias Hz', en: 'Every voice and Hz frequency' },
  pw_f3: { es: 'Descargas sin conexión ilimitadas', en: 'Unlimited offline downloads' },
  pw_monthly: { es: 'Mensual', en: 'Monthly' },
  pw_price_m: { es: '4,99 €/mes', en: '€4.99/mo' },
  pw_yearly: { es: 'Anual', en: 'Yearly' },
  pw_price_y: { es: '39,99 €/año', en: '€39.99/yr' },
  pw_save: { es: 'ahorra 33%', en: 'save 33%' },
  pw_cta: { es: 'Empezar 7 días gratis', en: 'Start 7 days free' },
  pw_later: { es: 'Quizás más tarde', en: 'Maybe later' },
  pw_active: { es: 'Plan Premium activo', en: 'Premium plan active' },
  pw_go: { es: 'Hazte Premium', en: 'Go Premium' },
  pw_cancel: { es: 'Cancelar suscripción', en: 'Cancel subscription' },

  // ad (free tier)
  ad_label: { es: 'anuncio', en: 'ad' },
  ad_title: { es: 'Tu meditación empieza en {s}…', en: 'Your meditation starts in {s}…' },
  ad_body: { es: 'Keiro gratis se apoya en un breve anuncio para cubrir el coste de generar tu meditación.', en: 'Free Keiro shows one short ad to cover the cost of generating your meditation.' },
  ad_fake: { es: 'Aquí iría tu anuncio · espacio publicitario', en: 'Your ad would live here · ad space' },
  ad_remove: { es: 'Quitar anuncios con Premium', en: 'Remove ads with Premium' },
  ad_continue: { es: 'Continuar', en: 'Continue' },

  // generating
  gen_title: { es: 'Trazando tu sendero…', en: 'Tracing your path…' },
  gen_1: { es: 'Escuchando cómo te sientes', en: 'Listening to how you feel' },
  gen_2: { es: 'Eligiendo las palabras justas', en: 'Choosing the right words' },
  gen_3: { es: 'Despertando la voz', en: 'Waking the voice' },
  gen_4: { es: 'Abriendo el camino', en: 'Opening the way' },

  // player
  player_step: { es: 'Un paso más en tu camino', en: 'One more step on your path' },
  player_done_title: { es: 'Has llegado', en: 'You have arrived' },
  player_done_body: { es: 'Este paso ya forma parte de tu sendero.', en: 'This step is now part of your path.' },
  player_download: { es: 'Guardar sin conexión', en: 'Save for offline' },
  player_downloaded: { es: 'Guardada sin conexión', en: 'Saved offline' },
  player_finish: { es: 'Terminar', en: 'Finish' },

  // library
  lib_title: { es: 'Tu biblioteca', en: 'Your library' },
  lib_sub: { es: 'Los pasos que ya has dado', en: 'The steps you have taken' },
  lib_offline: { es: 'Sin conexión', en: 'Offline' },
  lib_history: { es: 'Historial', en: 'History' },
  lib_empty: { es: 'Aún no hay pasos guardados.\nTu primera meditación te espera.', en: 'No steps saved yet.\nYour first meditation awaits.' },
  lib_offline_hint: { es: 'Las meditaciones guardadas se pueden escuchar sin internet, incluso en un avión.', en: 'Saved meditations can be played without internet — even on a plane.' },

  // profile
  profile_title: { es: 'Tu perfil', en: 'Your profile' },
  profile_days: { es: 'días de sendero', en: 'days on the path' },
  profile_sessions: { es: 'meditaciones', en: 'meditations' },
  profile_minutes: { es: 'minutos', en: 'minutes' },
  profile_edit: { es: 'Editar perfil', en: 'Edit profile' },
  profile_logout: { es: 'Cerrar sesión', en: 'Log out' },
  profile_age: { es: 'años', en: 'years old' },

  // settings
  settings_title: { es: 'Ajustes', en: 'Settings' },
  settings_appearance: { es: 'Apariencia', en: 'Appearance' },
  theme_light: { es: 'Claro', en: 'Light' },
  theme_dark: { es: 'Oscuro', en: 'Dark' },
  theme_system: { es: 'Sistema', en: 'System' },
  settings_language: { es: 'Idioma', en: 'Language' },
  settings_lang_hint: { es: 'Cambia la interfaz y la voz de tus meditaciones.', en: 'Changes the interface and the voice of your meditations.' },
  settings_voice: { es: 'Voz preferida', en: 'Preferred voice' },
  settings_about: { es: 'Acerca de Keiro', en: 'About Keiro' },
  settings_about_body: { es: 'Keiro (camino, sendero) es un espacio para descubrir, paso a paso, el camino hacia tu calma. Las meditaciones se generan con IA en el momento y las voces nacen de ElevenLabs.', en: 'Keiro (way, path) is a space to discover, step by step, the way to your calm. Meditations are generated by AI in the moment, with voices by ElevenLabs.' },

  // demo notice
  demo_badge: { es: 'demo', en: 'demo' },
  demo_voice: { es: 'voz de prueba del navegador', en: 'browser test voice' },
  demo_hint: { es: 'Modo demo: texto y audio simulados. Conecta tus claves de Claude y ElevenLabs para la generación real.', en: 'Demo mode: simulated text & audio. Connect your Claude and ElevenLabs keys for real generation.' },
};

export function translate(key: string, lang: Language, vars?: Record<string, string | number>): string {
  const entry = dict[key];
  let s = entry ? entry[lang] : key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
