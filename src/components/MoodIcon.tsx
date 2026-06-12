import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

/**
 * Thin-line pictograms for each mood, drawn with a single hairline stroke
 * to match the app's minimal aesthetic.
 */
export function MoodIcon({
  mood,
  size = 30,
  color = '#fff',
  strokeWidth = 1.5,
}: {
  mood: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const common = {
    stroke: color,
    strokeWidth,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  let content: React.ReactNode;
  switch (mood) {
    case 'anxiety':
      // restless jagged pulse
      content = (
        <>
          <Path d="M3 12 L6.5 12 L9 7 L12 16.5 L15 9 L17 12 L21 12" {...common} />
        </>
      );
      break;
    case 'sadness':
      // cloud with falling rain
      content = (
        <>
          <Path d="M7.2 14.5 A3.6 3.6 0 0 1 7.8 7.4 A4.8 4.8 0 0 1 17 8.6 A3.2 3.2 0 0 1 16.6 14.5 Z" {...common} />
          <Path d="M9.3 17 L8.6 19.2" {...common} />
          <Path d="M12.5 17 L11.8 19.2" {...common} />
          <Path d="M15.7 17 L15 19.2" {...common} />
        </>
      );
      break;
    case 'worry':
      // spiral of circling thoughts
      content = (
        <Path
          d="M12 12.2 A1.6 1.6 0 0 1 13.6 13.8 A3.2 3.2 0 0 1 10.4 17 A5 5 0 0 1 5.4 12 A6.8 6.8 0 0 1 12.2 5.2 A8.4 8.4 0 0 1 20.4 12"
          {...common}
        />
      );
      break;
    case 'stress':
      // lightning of tension
      content = <Path d="M13.5 3.5 L6.5 13 L11 13 L9.5 20.5 L17.5 10.5 L12.8 10.5 L15 3.5 Z" {...common} />;
      break;
    case 'insomnia':
      // crescent moon with a wakeful star
      content = (
        <>
          <Path d="M16.5 14.8 A6.5 6.5 0 1 1 8.8 6.2 A5.3 5.3 0 0 0 16.5 14.8 Z" {...common} />
          <Path d="M17.6 4.4 L17.6 7.4 M16.1 5.9 L19.1 5.9" {...common} />
        </>
      );
      break;
    case 'calm':
      // still water, soft ripples
      content = (
        <>
          <Path d="M4 8.5 Q8 6.2 12 8.5 T20 8.5" {...common} />
          <Path d="M4 13 Q8 10.7 12 13 T20 13" {...common} />
          <Path d="M4 17.5 Q8 15.2 12 17.5 T20 17.5" {...common} />
        </>
      );
      break;
    case 'gratitude':
      // open heart
      content = (
        <Path
          d="M12 19.2 C7.2 15.6 4.2 12.8 4.2 9.7 A3.8 3.8 0 0 1 12 7.6 A3.8 3.8 0 0 1 19.8 9.7 C19.8 12.8 16.8 15.6 12 19.2 Z"
          {...common}
        />
      );
      break;
    case 'focus':
    default:
      // quiet center
      content = (
        <>
          <Circle cx="12" cy="12" r="7" {...common} />
          <Circle cx="12" cy="12" r="3.4" {...common} />
          <Circle cx="12" cy="12" r="0.8" fill={color} stroke="none" />
        </>
      );
      break;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {content}
    </Svg>
  );
}
