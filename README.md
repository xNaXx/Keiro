# Keiro ✦

*Keiro (径路) significa sendero: el camino que descubres a medida que lo recorres.*

App de meditación minimalista donde cada sesión se **genera con IA en el momento** —ninguna meditación se repite— y se narra con **voces humanas de ElevenLabs**. Construida con React Native + Expo: corre en web hoy y compila a Android/iOS sin reescribir nada.

## Ejecutar

```bash
npm install
npm run web        # preview en navegador (http://localhost:8081)
npm run android    # dispositivo/emulador Android
npm run ios        # dispositivo/simulador iOS
```

## Qué incluye

- **Onboarding** con la metáfora del sendero y figuras aurora.
- **Registro** con Google / Facebook / Apple / email (simulado en local; listo para conectar a Supabase/Firebase) y **panel de usuario** con foto, nombre y edad.
- **Modo Sencillo**: eliges qué quieres soltar (Ansiedad, Tristeza, Preocupación…) y la IA decide el resto.
- **Modo Avanzado**: mood + momento del día + duración (3–20 min) + voz (catálogo femenino/masculino) + energía de la voz (susurro → luminosa).
- **Reproductor** con figura difuminada, anillos florales, transcripción línea a línea, waveform y controles glass.
- **Sin conexión**: guarda meditaciones en la biblioteca para escucharlas sin internet.
- **Tema claro / oscuro / sistema** y **idioma ES/EN** (afecta a interfaz y a la voz).
- **Perfil** con estadísticas: días de sendero, meditaciones, minutos.

## Modo demo vs. APIs reales

Sin claves, la app funciona en **modo demo**: los guiones salen de un generador local con variación aleatoria y el reproductor simula la narración (con un toggle ×1/×8 para probar rápido).

Para activar la generación real crea un archivo `.env` en la raíz:

```bash
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...    # guiones generados por Claude
EXPO_PUBLIC_ELEVENLABS_API_KEY=...          # voz natural (eleven_multilingual_v2)
```

Los adaptadores están en `src/services/claude.ts` y `src/services/elevenlabs.ts`. **En producción**, estas llamadas deben pasar por un backend propio para no exponer las claves en el binario.

## Estructura

```
app/                 # pantallas (expo-router)
  onboarding, auth, setup, settings, player
  (tabs)/            # home, biblioteca, perfil
  create/            # mode → simple|advanced → generating
src/
  theme.ts           # paletas claro/oscuro + degradados por mood
  i18n.ts            # diccionarios ES/EN
  data.ts            # moods, voces, duraciones, energías
  store.tsx          # estado global persistido (AsyncStorage)
  services/          # generador demo + adaptadores Claude/ElevenLabs
  components/        # AuroraFigure, RingFlower, PathTrail, MoodOrb, glass UI…
```

## Camino a producción (APK / App Store)

1. `npx eas build -p android --profile preview` genera una APK instalable (cuenta gratuita de Expo).
2. Conectar auth real (Supabase Auth con Google/Facebook/Apple).
3. Mover la generación IA/TTS a un backend y cachear audio para el modo offline real.
