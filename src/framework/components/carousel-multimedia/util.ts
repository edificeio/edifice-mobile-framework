import { ImageURISource } from 'react-native';

import { Source } from 'react-native-pdf';
import { ReactVideoSourceProperties } from 'react-native-video';

import { IFile } from '~/framework/modules/workspace/reducer';
import { computeVideoThumbnail } from '~/framework/modules/workspace/service';
import { extractVideoResolution } from '~/framework/util/htmlParser/content';
import { FileMedia, isPdfContent, MediaType, toURISource } from '~/framework/util/media';
import { INotificationMedia } from '~/framework/util/notifications';
import { sessionURISource } from '~/framework/util/transport/source';

export type SignedMediaSource = ImageURISource | ReactVideoSourceProperties | Source;

export const getSignedMediaSource = (item: FileMedia | FileMedia['src']): SignedMediaSource => {
  let uriSource: SignedMediaSource;

  const isFullMedia = typeof item === 'object' && item !== null && 'src' in item;
  const src = isFullMedia ? item.src : item;
  const type = isFullMedia ? item.type : undefined;

  if (typeof src === 'string') {
    uriSource = { uri: src };
  } else if (src instanceof URL) {
    uriSource = { uri: src.toString() };
  } else if (type === MediaType.VIDEO || type === MediaType.AUDIO) {
    uriSource = { uri: src } as ReactVideoSourceProperties;
  } else if (isFullMedia && type === MediaType.ATTACHMENT && isPdfContent(item as FileMedia)) {
    uriSource = src as Source;
  } else {
    uriSource = src as ImageURISource;
  }

  return sessionURISource(uriSource);
};

export const getSignedPosterSource = (src: FileMedia['src']): ImageURISource => {
  return getSignedMediaSource(src) as ImageURISource;
};

// File formatters
const normalizeUrl = (url: string) => url.split('?')[0];

// For workspace files
export const convertIFileToFileMedia = (files: IFile[]): FileMedia[] => {
  return files
    .filter(file => file.url !== undefined)
    .map(file => {
      const type = file.contentType || '';
      const isImage = type.startsWith('image/');
      const isAudio = type.startsWith('audio/');
      const isVideo = type.startsWith('video/');

      return {
        mime: isImage ? 'image/*' : isAudio ? 'audio/*' : isVideo ? 'video/*' : file.contentType || 'application/octet-stream',
        name: file.name,
        src: normalizeUrl(sessionURISource(toURISource(file.url!.toString())).uri || ''),
        type: isImage ? 'image' : isAudio ? 'audio' : isVideo ? 'video' : 'attachment',
      } as FileMedia;
    });
};

// For Timeline notifications
export const convertNotificationToFileMedia = (notificationMedias: INotificationMedia[]): FileMedia[] => {
  return notificationMedias
    .filter(media => ['image', 'audio', 'video'].includes(media.type))
    .map(
      media =>
        ({
          mime: media.type === 'image' ? 'image/*' : media.type === 'audio' ? 'audio/*' : 'video/*',
          name: media.name,
          poster:
            media.type === 'video' && media['document-id'] && media['video-resolution']
              ? computeVideoThumbnail(media['document-id'], extractVideoResolution(media['video-resolution']) || undefined)
              : undefined,
          src: normalizeUrl(sessionURISource(toURISource(media.src.toString())).uri || ''),
          type: media.type,
        }) as FileMedia,
    );
};
