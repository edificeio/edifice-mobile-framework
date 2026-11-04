import theme, { type IntentIcon, type IShades } from '~/app/theme';
import type { SvgIconName } from '~/framework/components/picture';
import { getMediaDisplay } from '~/modules/media/display';
import { isResourceMedia, type Media } from '~/modules/media/types';
import { getAppShades, useEntApp } from '~/modules/myapps/hooks';

const FILE_MEDIA_MATCHING_APP = 'Espace documentaire';

const DEFAULT_COLOR_SHADES: IShades = theme.palette.primary;

/**
 * Printable information about a resource of an app or a media: colors, icon and thumbnail.
 * - The resource of an app has the colors and the icon of its app, the other medias the ones of the documents app.
 * - The icon of a media that is not a resource is the one of `useMediaDisplay`.
 */
export const useResourceDisplay = (media: Media) => {
  const app = useEntApp(isResourceMedia(media) ? media.appName : FILE_MEDIA_MATCHING_APP);
  const { icon: mediaIcon, thumbnail } = getMediaDisplay(media);

  const color = getAppShades(app?.color) ?? DEFAULT_COLOR_SHADES;
  const icon: IntentIcon | string =
    isResourceMedia(media) && app?.icon ? { name: app.icon as SvgIconName, type: 'Svg' } : mediaIcon;

  return { color, icon, thumbnail };
};
