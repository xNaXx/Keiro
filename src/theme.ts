export type ThemeMode = 'light' | 'dark' | 'system';

export interface MoodPalette {
  /** gradient stops for the screen background, top → bottom */
  bg: [string, string, string];
  /** aurora figure body colors: outer, mid, glow core */
  figure: [string, string, string];
  /** accent for small details (sparkles, progress) */
  accent: string;
}

export interface Palette {
  name: 'light' | 'dark';
  bg: [string, string, string];
  text: string;
  textSoft: string;
  textFaint: string;
  glass: string;
  glassStrong: string;
  glassBorder: string;
  /** clearly visible background for a selected option */
  selectedBg: string;
  /** strong outline for the selected option */
  selectedBorder: string;
  line: string;
  accent: string;
  buttonText: string;
  stars: boolean;
}

export const LIGHT: Palette = {
  name: 'light',
  bg: ['#fdeBdf', '#f6d9e8', '#cfd8f4'],
  text: '#3a3550',
  textSoft: 'rgba(58,53,80,0.62)',
  textFaint: 'rgba(58,53,80,0.40)',
  glass: 'rgba(255,255,255,0.34)',
  glassStrong: 'rgba(255,255,255,0.55)',
  glassBorder: 'rgba(255,255,255,0.55)',
  selectedBg: 'rgba(255,255,255,0.78)',
  selectedBorder: 'rgba(58,53,80,0.55)',
  line: 'rgba(255,255,255,0.85)',
  accent: '#fff6ea',
  buttonText: '#3a3550',
  stars: false,
};

export const DARK: Palette = {
  name: 'dark',
  bg: ['#0b1026', '#141b3c', '#232c5c'],
  text: '#f2f4ff',
  textSoft: 'rgba(242,244,255,0.65)',
  textFaint: 'rgba(242,244,255,0.40)',
  glass: 'rgba(168,186,255,0.10)',
  glassStrong: 'rgba(168,186,255,0.16)',
  glassBorder: 'rgba(210,222,255,0.22)',
  selectedBg: 'rgba(190,208,255,0.30)',
  selectedBorder: 'rgba(240,246,255,0.95)',
  line: 'rgba(228,234,255,0.75)',
  accent: '#ffe9b8',
  buttonText: '#10142e',
  stars: true,
};

/** Mood-tinted palettes used on the player & generating screens. [light, dark] */
export const MOOD_PALETTES: Record<string, { light: MoodPalette; dark: MoodPalette }> = {
  anxiety: {
    light: {
      bg: ['#dff0fb', '#cfe3fa', '#b9cdf6'],
      figure: ['#8fb4ef', '#6f97e8', '#dcebff'],
      accent: '#ffffff',
    },
    dark: {
      bg: ['#0a1230', '#13204a', '#22335f'],
      figure: ['#4a6fd8', '#3a57b8', '#aecbff'],
      accent: '#cfe0ff',
    },
  },
  sadness: {
    light: {
      bg: ['#dbe7fb', '#c5d4f7', '#a9bdf0'],
      figure: ['#7d9ae8', '#5f7fe0', '#d3e2ff'],
      accent: '#ffffff',
    },
    dark: {
      bg: ['#0a0f2c', '#101a44', '#1c2a58'],
      figure: ['#3c5bc8', '#2e47a8', '#9cbcff'],
      accent: '#c4d6ff',
    },
  },
  worry: {
    light: {
      bg: ['#e8e3fa', '#d9d0f6', '#bfb6ef'],
      figure: ['#a18ae6', '#8a6fde', '#e6dcff'],
      accent: '#ffffff',
    },
    dark: {
      bg: ['#120f30', '#1c1748', '#2c2462'],
      figure: ['#6a4fd0', '#5740ae', '#c3b2ff'],
      accent: '#dcd0ff',
    },
  },
  stress: {
    light: {
      bg: ['#fde7da', '#f8d3cd', '#ecb8c6'],
      figure: ['#ef9d80', '#e87d66', '#ffe3c9'],
      accent: '#ffffff',
    },
    dark: {
      bg: ['#1c0f28', '#2e1840', '#46224e'],
      figure: ['#d86a4f', '#b84e3a', '#ffc09c'],
      accent: '#ffd9c0',
    },
  },
  insomnia: {
    light: {
      bg: ['#e3e6f6', '#cfd2ec', '#b2b6da'],
      figure: ['#8e93cf', '#7176bd', '#dde0ff'],
      accent: '#ffffff',
    },
    dark: {
      bg: ['#070a1e', '#0d1232', '#171d44'],
      figure: ['#3a4198', '#2b3076', '#a3aaff'],
      accent: '#c9ceff',
    },
  },
  calm: {
    light: {
      bg: ['#fdeBdf', '#f6d9e8', '#cfd8f4'],
      figure: ['#f3b8c9', '#e99ab9', '#ffe9c9'],
      accent: '#ffffff',
    },
    dark: {
      bg: ['#160f2e', '#251847', '#3a2560'],
      figure: ['#b56fa8', '#94538c', '#ffd2b8'],
      accent: '#ffdcc8',
    },
  },
  gratitude: {
    light: {
      bg: ['#fdf0d9', '#fbdcc4', '#f2bfc4'],
      figure: ['#f2b06f', '#ea934f', '#fff0c4'],
      accent: '#ffffff',
    },
    dark: {
      bg: ['#1c1226', '#2e1c38', '#4a2c42'],
      figure: ['#d8904a', '#b87238', '#ffdfa0'],
      accent: '#ffe6b8',
    },
  },
  focus: {
    light: {
      bg: ['#ddf3ef', '#cce6ec', '#b4cee8'],
      figure: ['#73bdb4', '#54a3a0', '#dcfff2'],
      accent: '#ffffff',
    },
    dark: {
      bg: ['#07141e', '#0d2230', '#163448'],
      figure: ['#2f8e88', '#256f70', '#9cf0dc'],
      accent: '#c2f5e6',
    },
  },
};

export const FONTS = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  serif: 'CormorantGaramond_500Medium',
  serifItalic: 'CormorantGaramond_500Medium_Italic',
};

export const RADII = { card: 32, button: 26, chip: 18, orb: 999 };
