import { Image } from 'expo-image';

import { IconSizes } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/>',
  catalog: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  agenda: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h3M14 15h2"/>',
  cart: '<path d="M2 3h3l3 13h11l3-9H6M8 19h11"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  'chevron-right': '<path d="m9 5 7 7-7 7"/>',
  'chevron-left': '<path d="m15 5-7 7 7 7"/>',
  service: '<path d="M5 21V11a2 2 0 0 1 4 0V6a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v5c0 4-3 6-7 6z"/>',
  course: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1zM12 5v15"/>',
  product: '<path d="M4 8h16l-1 13H5L4 8zM9 9V6a3 3 0 0 1 6 0v3"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  filter: '<path d="M3 6h18M6 12h12M9 18h6"/><circle cx="8" cy="6" r="2" fill="white"/><circle cx="15" cy="12" r="2" fill="white"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M10 21h4"/>',
  heart: '<path d="M20.8 8.5c0 4.2-8.8 10-8.8 10S3.2 12.7 3.2 8.5a4.4 4.4 0 0 1 8.8 0 4.4 4.4 0 0 1 8.8 0z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l-1.8 1.8a1.7 1.7 0 0 0-1.9-.3 8 8 0 0 1-2 .8L13.5 21h-3l-.5-1.8a8 8 0 0 1-2-.8 1.7 1.7 0 0 0-1.9.3l-1.8-1.8a1.7 1.7 0 0 0 .3-1.9 8 8 0 0 1-.8-2L2 12.5v-3l1.8-.5a8 8 0 0 1 .8-2 1.7 1.7 0 0 0-.3-1.9l1.8-1.8a1.7 1.7 0 0 0 1.9.3 8 8 0 0 1 2-.8L10.5 1h3l.5 1.8a8 8 0 0 1 2 .8 1.7 1.7 0 0 0 1.9-.3l1.8 1.8a1.7 1.7 0 0 0-.3 1.9 8 8 0 0 1 .8 2l1.8.5v3l-1.8.5a8 8 0 0 1-.8 2z"/>',
} as const;

export type IconName = keyof typeof paths;

// Android's Expo Image data-URL loader expects a base64 payload. SVG markup is ASCII.
function encodeSvg(markup: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let encoded = '';
  for (let index = 0; index < markup.length; index += 3) {
    const first = markup.charCodeAt(index);
    const second = markup.charCodeAt(index + 1) || 0;
    const third = markup.charCodeAt(index + 2) || 0;
    encoded += alphabet[first >> 2] + alphabet[((first & 3) << 4) | (second >> 4)]
      + (index + 1 < markup.length ? alphabet[((second & 15) << 2) | (third >> 6)] : '=')
      + (index + 2 < markup.length ? alphabet[third & 63] : '=');
  }
  return encoded;
}

export function Icon({ name, size = IconSizes.medium, color }: { name: IconName; size?: number; color?: string }) {
  const theme = useTheme();
  const iconColor = color ?? theme.text;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
  return <Image source={{ uri: `data:image/svg+xml;base64,${encodeSvg(svg)}` }} style={{ width: size, height: size }} contentFit="contain" accessible={false} />;
}
