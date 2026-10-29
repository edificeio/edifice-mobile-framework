import { useSelector } from 'react-redux';

import theme, { type IntentIcon, type IShades } from '~/app/theme';
import type { SvgIconName } from '~/framework/components/picture';
import { selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { getMediaDisplay } from '~/modules/media/display';
import { isResourceMedia, type Media } from '~/modules/media/types';

const FILE_MEDIA_MATCHING_APP = 'Espace documentaire';

const DEFAULT_COLOR_SHADES: IShades = theme.palette.primary;

/**
 * Printable information about a resource of an app or a media: colors, icon and thumbnail.
 * - The resource of an app has the colors and the icon of its app, the other medias the ones of the documents app.
 * - The icon of a media that is not a resource is the one of `useMediaDisplay`.
 * ToDo(media-migration): the colors of the apps come from the redux store of myapps. Read them from the new myapps (`useAppTheme`) once it is migrated.
 */
export const useResourceDisplay = (media: Media) => {
  const aggregatedApps = useSelector(selectAggregatedApps);
  const app = aggregatedApps[isResourceMedia(media) ? media.appName : FILE_MEDIA_MATCHING_APP];
  const { icon: mediaIcon, thumbnail } = getMediaDisplay(media);

  const colorName: keyof typeof theme.palette.complementary | undefined = app?.color;
  const color = (colorName && colorName !== 'nabook-color' && theme.palette.complementary[colorName]) || DEFAULT_COLOR_SHADES;
  const icon: IntentIcon | string =
    isResourceMedia(media) && app?.icon ? { name: app.icon as SvgIconName, type: 'Svg' } : mediaIcon;

  return { color, icon, thumbnail };
};
