import { svgExists } from '~/framework/components/picture';
import { toURISource } from '~/modules/media/util';
import { isIconName } from '~/modules/myapps/model/display';

import { AppIcon } from './types';

const HTTP_REGEX = /^https?:\/\//i;

const isWorkspace = (icon: string) => icon.startsWith('/workspace/');
const isHttp = (icon: string) => HTTP_REGEX.test(icon);
/** Whether the address is the one of an SVG (its path, without its query). */
const isSvg = (url: string) => url.split('?')[0].toLowerCase().endsWith('.svg');

/** Sent with the remote images, as the old module did. Reason not documented: kept as it is. */
const USER_AGENT = 'Mozilla/5.0 (Android)';

/**
 * How to show the icon of an app (`EntApp.icon`): an `Svg` of the app, an image of the workspace, a remote image or SVG.
 * The address is kept whole: its query may be needed (a thumbnail, a signature).
 */
export const resolveAppIcon = (icon?: string | null): AppIcon => {
  if (!icon) return { type: 'fallback' };

  if (isIconName(icon)) return svgExists(icon) ? { name: icon, type: 'svg' } : { type: 'fallback' };

  // Signed by `Image` (`~/modules/media/components`), as any address of the platform
  if (isWorkspace(icon)) return { source: toURISource(icon), type: 'image' };

  if (isHttp(icon)) {
    if (isSvg(icon)) return { type: 'svg-uri', uri: icon };
    return { source: { headers: { 'User-Agent': USER_AGENT }, uri: icon }, type: 'image' };
  }

  return { type: 'fallback' };
};
