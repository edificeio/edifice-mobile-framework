import type { ImageURISource } from 'react-native';

import type { ReactVideoSourceProperties } from 'react-native-video';

import theme, { type IntentIcon } from '~/app/theme';
import type { SvgIconName } from '~/framework/components/picture';

import { mime, mimeCompare } from './mime';
import {
  isAttachmentMedia,
  isAudioMedia,
  isEmbeddedMedia,
  isFileMedia,
  isImageMedia,
  isLinkMedia,
  isOfficeMedia,
  isPlayableMedia,
  isResourceMedia,
  isVideoMedia,
  type Media,
} from './types';
import { toURISource } from './util';

const DEFAULT_MEDIA_ICON: SvgIconName = 'ui-infoCircle';

/**
 * The icon that stands for a media in the lists (the extension for a file without a better one).
 */
export const getMediaIcon = (media: Media): IntentIcon | string => {
  if (isImageMedia(media) || (isAttachmentMedia(media) && mimeCompare(media.mime, 'image/*') === 0)) return theme.media.image;
  if (isVideoMedia(media) || (isAttachmentMedia(media) && mimeCompare(media.mime, 'video/*') === 0)) return theme.media.video;
  if (isAudioMedia(media) || (isAttachmentMedia(media) && mimeCompare(media.mime, 'audio/*') === 0)) return theme.media.audio;
  if (isAttachmentMedia(media) && mimeCompare(media.mime, 'application/pdf') === 0) return 'PDF';
  if (isEmbeddedMedia(media)) return theme.media.embedded;
  if (isLinkMedia(media)) return theme.media.link;
  if (isResourceMedia(media)) return theme.media.embedded;
  if (isFileMedia(media)) return mime.getExtension(media.mime)?.toLocaleUpperCase() ?? theme.media.default;
  return theme.media.default;
};

/**
 * What shows a media in a list: its icon (`{ text }` is the extension of a file) and its thumbnail, if it has one.
 */
export const getMediaDisplay = (media: Media) => {
  let icon: IntentIcon | string = theme.media[media.type] ?? { name: DEFAULT_MEDIA_ICON, type: 'Svg' };
  if (isAttachmentMedia(media) || isOfficeMedia(media)) {
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

  return { icon, thumbnail: thumbnail ? toURISource<ImageURISource | ReactVideoSourceProperties>(thumbnail) : undefined };
};
