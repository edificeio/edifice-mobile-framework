import { computeVideoThumbnail } from '~/framework/modules/workspace/service';
import { extractVideoResolution } from '~/framework/util/htmlParser/content';
import type { INotificationMedia } from '~/framework/util/notifications';
import { sessionImageSource } from '~/framework/util/transport';

import { PreviewMedia } from './types';

/** The still of a media, when it has one. */
export const mediaSource = (media: PreviewMedia) => {
  if (media.type === 'image' && media.src) return sessionImageSource({ uri: media.src as string });
  if (media.type === 'video' && media['document-id']) {
    const resolution = media['video-resolution'] ? extractVideoResolution(media['video-resolution']) : undefined;
    return sessionImageSource({ uri: computeVideoThumbnail(media['document-id'], resolution) });
  }
  return undefined;
};

export const getShownMedia = (media: INotificationMedia[], withVideos?: boolean) =>
  (media as PreviewMedia[]).filter(item => item.type === 'image' || (withVideos && item.type === 'video' && mediaSource(item)));
