import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { IconSizes } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

const drawings = {
  home: <><Path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><Path d="M9 21v-7h6v7" /></>,
  catalog: <><Rect x="3" y="3" width="7" height="7" rx="1" /><Rect x="14" y="3" width="7" height="7" rx="1" /><Rect x="3" y="14" width="7" height="7" rx="1" /><Rect x="14" y="14" width="7" height="7" rx="1" /></>,
  agenda: <><Rect x="3" y="5" width="18" height="16" rx="2" /><Path d="M7 3v4M17 3v4M3 10h18M8 15h3M14 15h2" /></>,
  cart: <><Path d="M2 3h3l3 13h11l3-9H6M8 19h11" /><Circle cx="9" cy="21" r="1" /><Circle cx="18" cy="21" r="1" /></>,
  profile: <><Circle cx="12" cy="8" r="4" /><Path d="M4 21a8 8 0 0 1 16 0" /></>,
  search: <><Circle cx="10" cy="10" r="6" /><Path d="m15 15 6 6" /></>,
  'chevron-right': <Path d="m9 5 7 7-7 7" />,
  'chevron-left': <Path d="m15 5-7 7 7 7" />,
  service: <Path d="M5 21V11a2 2 0 0 1 4 0V6a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v5c0 4-3 6-7 6z" />,
  course: <Path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1zM12 5v15" />,
  product: <Path d="M4 8h16l-1 13H5L4 8zM9 9V6a3 3 0 0 1 6 0v3" />,
  close: <Path d="m6 6 12 12M18 6 6 18" />,
  filter: <><Path d="M3 6h18M6 12h12M9 18h6" /><Circle cx="8" cy="6" r="2" fill="white" /><Circle cx="15" cy="12" r="2" fill="white" /></>,
  bell: <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M10 21h4" />,
  heart: <Path d="M20.8 8.5c0 4.2-8.8 10-8.8 10S3.2 12.7 3.2 8.5a4.4 4.4 0 0 1 8.8 0 4.4 4.4 0 0 1 8.8 0z" />,
  settings: <><Circle cx="12" cy="12" r="3" /><Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l-1.8 1.8a1.7 1.7 0 0 0-1.9-.3 8 8 0 0 1-2 .8L13.5 21h-3l-.5-1.8a8 8 0 0 1-2-.8 1.7 1.7 0 0 0-1.9.3l-1.8-1.8a1.7 1.7 0 0 0 .3-1.9 8 8 0 0 1-.8-2L2 12.5v-3l1.8-.5a8 8 0 0 1 .8-2 1.7 1.7 0 0 0-.3-1.9l1.8-1.8a1.7 1.7 0 0 0 1.9.3 8 8 0 0 1 2-.8L10.5 1h3l.5 1.8a8 8 0 0 1 2 .8 1.7 1.7 0 0 0 1.9-.3l1.8 1.8a1.7 1.7 0 0 0-.3 1.9 8 8 0 0 1 .8 2l1.8.5v3l-1.8.5a8 8 0 0 1-.8 2z" /></>,
} as const;

export type IconName = keyof typeof drawings;

export function Icon({ name, size = IconSizes.medium, color }: { name: IconName; size?: number; color?: string }) {
  const theme = useTheme();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color ?? theme.text} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" accessible={false}>
    {drawings[name]}
  </Svg>;
}
