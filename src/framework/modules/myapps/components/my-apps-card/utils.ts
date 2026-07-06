import { svgExists } from '~/framework/components/picture';
import { toURISource } from '~/framework/util/media';
import { sessionImageSource } from '~/framework/util/transport';

import { AppIcon } from './types';

const HTTP_REGEX = /^https?:\/\//i;

const isInternalSvg = (icon: string) => !icon.includes('/') && !icon.includes('.');
const isWorkspace = (icon: string) => icon.startsWith('/workspace/');
const isHttp = (icon: string) => HTTP_REGEX.test(icon);
const isSvg = (icon: string) => icon.toLowerCase().endsWith('.svg');

const stripQueryParams = (url: string): string => {
  const [path] = url.split('?');
  return path;
};

export const resolveAppIcon = (icon?: string | null): AppIcon => {
  if (!icon) return { type: 'fallback' };

  if (isInternalSvg(icon)) {
    if (!svgExists(icon)) return { type: 'fallback' };
    return { name: icon, type: 'svg' };
  }

  if (isWorkspace(icon)) {
    const cleanIcon = stripQueryParams(icon);
    return {
      source: sessionImageSource(toURISource(cleanIcon)),
      type: 'image',
    };
  }

  if (isHttp(icon)) {
    if (isSvg(icon)) {
      return { type: 'svg-uri', uri: icon };
    }

    return {
      source: {
        headers: { 'User-Agent': 'Mozilla/5.0 (Android)' },
        uri: stripQueryParams(icon),
      },
      type: 'image',
    };
  }

  return { type: 'fallback' };
};
