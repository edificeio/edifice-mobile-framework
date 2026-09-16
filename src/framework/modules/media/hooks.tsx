import { ImageURISource } from 'react-native';

import { NavigationProp } from '@react-navigation/native';
import { ReactVideoSourceProperties } from 'react-native-video';
import { useSelector } from 'react-redux';

import { INTENT_TYPE, openIntent } from '~/app/intents';
import { NavigationRootParams } from '~/app/navigation/types';
import theme, { IntentIcon, IShades } from '~/app/theme';
import { SvgIconName } from '~/framework/components/picture';
import { mime, toURISource } from '~/framework/modules/media';
import { openUrl } from '~/framework/util/linking';

import { isAttachmentMedia, isFileMedia, isImageMedia, isOfficeMedia, isPlayableMedia, isResourceMedia, Media } from './types';
import { AudienceParameter } from '../audience/types';
import { selectAggregatedApps } from '../myapps/reducer';

const FILE_MEDIA_MATCHING_APP = 'Espace documentaire';

const DEFAULT_MEDIA_DISPLAY_COLOR_SHADES: IShades = theme.palette.primary;

const DEFAULT_MEDIA_ICON: SvgIconName = 'ui-infoCircle';

/**
 * Get printable information about given media.
 * Returns :
 *  - color : shades object corresponding to the media type
 *  - icon : Svg icon or Text icon (file extension)
 *  - thumbnail : Image thumbnail if exists
 * @param media
 */
export function useMediaDisplay(media: Media) {
  const aggregatedApps = useSelector(selectAggregatedApps);
  const matchingEntApp = isResourceMedia(media) ? media.appName : FILE_MEDIA_MATCHING_APP;

  const colorName: keyof typeof theme.palette.complementary | undefined = aggregatedApps[matchingEntApp].color;
  const color =
    (colorName && colorName !== 'nabook-color' && theme.palette.complementary[colorName]) || DEFAULT_MEDIA_DISPLAY_COLOR_SHADES;

  let icon: IntentIcon | string = theme.media[media.type] ?? { name: DEFAULT_MEDIA_ICON, type: 'Svg' };
  if (isResourceMedia(media) && aggregatedApps[matchingEntApp]?.icon) {
    icon = { name: aggregatedApps[matchingEntApp].icon as SvgIconName, type: 'Svg' };
  } else if (isAttachmentMedia(media) || isOfficeMedia(media)) {
    const ext = mime.getExtension(media.mime);
    if (ext) icon = { text: ext.toLocaleUpperCase(), type: 'Text' };
  }

  const thumbnail = isResourceMedia(media)
    ? media.thumbnail
    : isImageMedia(media)
      ? media.src
      : isPlayableMedia(media)
        ? media.poster
        : undefined;

  return { color, icon, thumbnail: thumbnail ? toURISource<ImageURISource | ReactVideoSourceProperties>(thumbnail) : undefined };
}

/**
 * Get callback for opening given media
 * @param media
 */
export function openMedias(navigation: NavigationProp<NavigationRootParams>, medias: Media[], index: number = 0) {
  const media = medias[index % medias.length];
  const url = toURISource(media.src).uri;
  if (isFileMedia(media)) {
    const carouselMedias = medias.filter(isFileMedia);
    const startIndex = carouselMedias.indexOf(media);
    navigation.navigate('media/carousel', {
      media: carouselMedias,
      startIndex: startIndex !== -1 ? startIndex : 0,
    });
  } else if (isResourceMedia(media) && url) {
    openIntent(media.appName, INTENT_TYPE.OPEN_RESOURCE, { id: media.resourceId, url });
  } else if (url) {
    openUrl(url);
  }
}

/**
 * Get callback for opening given media
 * @param media
 */
export function openMedia(navigation: NavigationProp<NavigationRootParams>, media: Media) {
  openMedias(navigation, [media], 0);
}
