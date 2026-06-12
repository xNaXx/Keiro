import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface P {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const D = ({ size = 22, color = '#fff', strokeWidth = 1.5, children }: P & { children: React.ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </Svg>
);

export const ArrowLeft = (p: P) => (
  <D {...p}>
    <Path d="M15 5 L8 12 L15 19" />
  </D>
);

export const Menu = (p: P) => (
  <D {...p}>
    <Line x1="5" y1="9.5" x2="19" y2="9.5" />
    <Line x1="5" y1="14.5" x2="19" y2="14.5" />
  </D>
);

export const Plus = (p: P) => (
  <D {...p}>
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </D>
);

export const Check = (p: P) => (
  <D {...p}>
    <Path d="M5 12.5 L10 17.5 L19 7" />
  </D>
);

export const Play = ({ size = 22, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M8 5.5 C8 4.7 8.9 4.2 9.6 4.6 L19 11.1 C19.7 11.5 19.7 12.5 19 12.9 L9.6 19.4 C8.9 19.8 8 19.3 8 18.5 Z" fill={color} />
  </Svg>
);

export const Pause = ({ size = 22, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="6.5" y="5" width="3.6" height="14" rx="1.4" fill={color} />
    <Rect x="13.9" y="5" width="3.6" height="14" rx="1.4" fill={color} />
  </Svg>
);

export const SkipBack = (p: P) => (
  <D {...p} strokeWidth={1.8}>
    <Path d="M12.5 7 L7.5 12 L12.5 17" />
    <Path d="M17.5 7 L12.5 12 L17.5 17" />
  </D>
);

export const SkipFwd = (p: P) => (
  <D {...p} strokeWidth={1.8}>
    <Path d="M6.5 7 L11.5 12 L6.5 17" />
    <Path d="M11.5 7 L16.5 12 L11.5 17" />
  </D>
);

export const Download = (p: P) => (
  <D {...p}>
    <Path d="M12 4 L12 14.5" />
    <Path d="M7.5 10.5 L12 15 L16.5 10.5" />
    <Path d="M5 19 L19 19" />
  </D>
);

export const Sunrise = (p: P) => (
  <D {...p}>
    <Path d="M5 17 A 7 7 0 0 1 19 17" />
    <Line x1="12" y1="4" x2="12" y2="7" />
    <Line x1="4" y1="20" x2="20" y2="20" />
  </D>
);

export const Sun = (p: P) => (
  <D {...p}>
    <Circle cx="12" cy="12" r="4.5" />
    <Line x1="12" y1="3" x2="12" y2="5" />
    <Line x1="12" y1="19" x2="12" y2="21" />
    <Line x1="3" y1="12" x2="5" y2="12" />
    <Line x1="19" y1="12" x2="21" y2="12" />
  </D>
);

export const Sunset = (p: P) => (
  <D {...p}>
    <Path d="M5 15 A 7 7 0 0 1 19 15" />
    <Line x1="4" y1="18.5" x2="20" y2="18.5" />
    <Line x1="7" y1="21.5" x2="17" y2="21.5" />
  </D>
);

export const Moon = (p: P) => (
  <D {...p}>
    <Path d="M19 14.5 A 8 8 0 1 1 9.5 5 A 6.5 6.5 0 0 0 19 14.5 Z" />
  </D>
);

export const Home = (p: P) => (
  <D {...p}>
    <Path d="M4.5 11 L12 4.5 L19.5 11 L19.5 19.5 L4.5 19.5 Z" />
  </D>
);

export const Library = (p: P) => (
  <D {...p}>
    <Path d="M5 19 C8 6 16 6 19 19" />
    <Circle cx="12" cy="13.5" r="1.2" fill={p.color} stroke="none" />
  </D>
);

export const UserIcon = (p: P) => (
  <D {...p}>
    <Circle cx="12" cy="8.5" r="3.5" />
    <Path d="M5 19.5 C6 15.5 9 14 12 14 C15 14 18 15.5 19 19.5" />
  </D>
);

export const Gear = (p: P) => (
  <D {...p}>
    <Circle cx="12" cy="12" r="3.1" />
    <Path d="M19.4 13.7 C19.5 13.1 19.5 12.6 19.5 12 C19.5 11.4 19.5 10.9 19.4 10.3 L21.2 8.9 L19.4 5.8 L17.2 6.6 C16.4 5.9 15.4 5.3 14.4 5 L14 2.8 L10 2.8 L9.6 5 C8.6 5.3 7.6 5.9 6.8 6.6 L4.6 5.8 L2.8 8.9 L4.6 10.3 C4.5 10.9 4.5 11.4 4.5 12 C4.5 12.6 4.5 13.1 4.6 13.7 L2.8 15.1 L4.6 18.2 L6.8 17.4 C7.6 18.1 8.6 18.7 9.6 19 L10 21.2 L14 21.2 L14.4 19 C15.4 18.7 16.4 18.1 17.2 17.4 L19.4 18.2 L21.2 15.1 Z" />
  </D>
);

export const Globe = (p: P) => (
  <D {...p}>
    <Circle cx="12" cy="12" r="8" />
    <Path d="M4 12 L20 12 M12 4 C8 8.5 8 15.5 12 20 C16 15.5 16 8.5 12 4" />
  </D>
);

export const Logout = (p: P) => (
  <D {...p}>
    <Path d="M14 4 L6 4 L6 20 L14 20" />
    <Path d="M11 12 L20 12 M16.5 8.5 L20 12 L16.5 15.5" />
  </D>
);

export const Pencil = (p: P) => (
  <D {...p}>
    <Path d="M5 19 L5.8 15.6 L16.2 5.2 A 1.6 1.6 0 0 1 18.8 7.8 L8.4 18.2 Z" />
  </D>
);

export const Camera = (p: P) => (
  <D {...p}>
    <Path d="M4 8 L8 8 L9.5 5.5 L14.5 5.5 L16 8 L20 8 L20 18.5 L4 18.5 Z" />
    <Circle cx="12" cy="13" r="3" />
  </D>
);

export const SpeakerWave = (p: P) => (
  <D {...p}>
    <Path d="M4 10 L4 14 L7.5 14 L12 18 L12 6 L7.5 10 Z" />
    <Path d="M15.5 9.5 A 4 4 0 0 1 15.5 14.5" />
    <Path d="M18 7.5 A 7 7 0 0 1 18 16.5" />
  </D>
);

export const GoogleLogo = ({ size = 20 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M21.6 12.2 C21.6 11.5 21.5 10.9 21.4 10.2 L12 10.2 L12 14 L17.4 14 C17.2 15.2 16.5 16.3 15.4 17 L15.4 19.5 L18.6 19.5 C20.5 17.7 21.6 15.2 21.6 12.2 Z" fill="#4285F4" />
    <Path d="M12 22 C14.7 22 17 21.1 18.6 19.5 L15.4 17 C14.5 17.6 13.3 18 12 18 C9.4 18 7.2 16.2 6.4 13.9 L3.1 13.9 L3.1 16.4 C4.7 19.7 8.1 22 12 22 Z" fill="#34A853" />
    <Path d="M6.4 13.9 C6.2 13.3 6.1 12.7 6.1 12 C6.1 11.3 6.2 10.7 6.4 10.1 L6.4 7.6 L3.1 7.6 C2.4 8.9 2 10.4 2 12 C2 13.6 2.4 15.1 3.1 16.4 Z" fill="#FBBC05" />
    <Path d="M12 6 C13.5 6 14.8 6.5 15.8 7.5 L18.7 4.6 C17 3 14.7 2 12 2 C8.1 2 4.7 4.3 3.1 7.6 L6.4 10.1 C7.2 7.8 9.4 6 12 6 Z" fill="#EA4335" />
  </Svg>
);

export const FacebookLogo = ({ size = 20 }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill="#1877F2" />
    <Path d="M15.5 12 L13.3 12 L13.3 19.5 L10.5 19.5 L10.5 12 L9 12 L9 9.6 L10.5 9.6 L10.5 8.1 C10.5 6.2 11.3 5 13.5 5 L15.6 5 L15.6 7.4 L14.3 7.4 C13.5 7.4 13.3 7.7 13.3 8.4 L13.3 9.6 L15.8 9.6 Z" fill="#fff" />
  </Svg>
);

export const AppleLogo = ({ size = 20, color = '#000' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M16.7 12.7 C16.7 10.4 18.6 9.3 18.7 9.2 C17.6 7.7 16 7.5 15.4 7.4 C14 7.3 12.7 8.2 12 8.2 C11.3 8.2 10.2 7.4 9 7.5 C7.5 7.5 6.1 8.4 5.3 9.7 C3.7 12.4 4.9 16.4 6.4 18.6 C7.2 19.7 8.1 20.9 9.3 20.8 C10.4 20.8 10.9 20.1 12.3 20.1 C13.7 20.1 14.1 20.8 15.3 20.8 C16.6 20.8 17.4 19.7 18.1 18.7 C19 17.4 19.3 16.2 19.4 16.1 C19.3 16.1 16.7 15.1 16.7 12.7 Z M14.4 5.9 C15 5.1 15.4 4.1 15.3 3 C14.4 3 13.3 3.6 12.7 4.4 C12.1 5.1 11.6 6.2 11.7 7.2 C12.7 7.3 13.8 6.7 14.4 5.9 Z"
      fill={color}
    />
  </Svg>
);
