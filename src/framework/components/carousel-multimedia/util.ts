import { Alert, ImageURISource } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { Source } from 'react-native-pdf';
import { ReactVideoSourceProperties } from 'react-native-video';

import { I18n } from '~/app/i18n';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { IFile } from '~/framework/modules/workspace/reducer';
import { computeVideoThumbnail } from '~/framework/modules/workspace/service';
import { extractVideoResolution } from '~/framework/util/htmlParser/content';
import { FileMedia, isPdfContent, MediaType, toURISource } from '~/framework/util/media';
import { INotificationMedia } from '~/framework/util/notifications';
import { OldStorageFunctions } from '~/framework/util/storage';
import { sessionURISource } from '~/framework/util/transport/source';

export const showPrivacyAlert = async (action: () => void) => {
  try {
    const getDatePrivacyAlert: string | Temporal.PlainDate | null | undefined =
      await OldStorageFunctions.getItemJson('privacyAlert');
    const today = Temporal.Now.plainDateISO();

    if (!getDatePrivacyAlert) {
      Alert.alert(I18n.get('carousel-privacy-title'), I18n.get('carousel-privacy-text'), [
        { onPress: action, text: I18n.get('carousel-privacy-button') },
      ]);
      await OldStorageFunctions.setItemJson('privacyAlert', today.toString());
    } else {
      const lastAlertDate = Temporal.PlainDate.from(getDatePrivacyAlert);
      if (Temporal.PlainDate.compare(today, lastAlertDate) > 0) {
        Alert.alert(I18n.get('carousel-privacy-title'), I18n.get('carousel-privacy-text'), [
          { onPress: action, text: I18n.get('carousel-privacy-button') },
        ]);
        await OldStorageFunctions.setItemJson('privacyAlert', today.toString());
      } else {
        action();
      }
    }
  } catch {
    throw new Error();
  }
};

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
    uriSource = { uri: typeof src === 'string' ? src : src.uri } as ReactVideoSourceProperties;
  } else if (isFullMedia && type === MediaType.ATTACHMENT && isPdfContent(item as FileMedia)) {
    uriSource = src as Source;
  } else {
    uriSource = src as ImageURISource;
  }

  // Note: carousel may be invoked when non-logged.
  // ToDo: carrousel does NEVER sign anything. Signing sources is the responsibility of the previous screen.
  if (!getSession()) return uriSource;
  return sessionURISource(uriSource);
};

export const getSignedPosterSource = (src: FileMedia['src'], thumbnailSize?: string): ImageURISource => {
  if (thumbnailSize) {
    const urlStr = src instanceof URL ? src.toString() : typeof src === 'string' ? src : undefined;
    if (urlStr) {
      // Replace existing thumbnail param in videos to fetch a smaller one or check the existence of params to choose between & and ?
      const thumbnailSrc = urlStr.includes('thumbnail=')
        ? urlStr.replace(/thumbnail=[^&]*/, `thumbnail=${thumbnailSize}`)
        : urlStr.includes('?')
          ? `${urlStr}&thumbnail=${thumbnailSize}`
          : `${urlStr}?thumbnail=${thumbnailSize}`;
      return getSignedMediaSource(thumbnailSrc) as ImageURISource;
    }
  }
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
    .filter(media => ['image', 'audio', 'video', 'iframe'].includes(media.type))
    .map(media => {
      if (media.type === 'iframe') {
        const src = typeof media.src === 'string' && media.src.startsWith('//') ? 'https:' + media.src : (media.src as string);
        return { mime: MediaType.EMBEDDED, name: media.name, src, type: MediaType.EMBEDDED } as unknown as FileMedia;
      }
      return {
        mime: media.type === 'image' ? 'image/*' : media.type === 'audio' ? 'audio/*' : 'video/*',
        name: media.name,
        poster:
          media.type === 'video' && media['document-id'] && media['video-resolution']
            ? computeVideoThumbnail(media['document-id'], extractVideoResolution(media['video-resolution']) || undefined)
            : undefined,
        src: normalizeUrl(sessionURISource(toURISource(media.src.toString())).uri || ''),
        type: media.type,
      } as FileMedia;
    });
};
