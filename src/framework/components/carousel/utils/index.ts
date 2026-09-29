import { Alert, ImageURISource } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { Source } from 'react-native-pdf';
import { ReactVideoSourceProperties } from 'react-native-video';

import { I18n } from '~/util/i18n';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { FileMedia, isPdfContent, MediaType } from '~/framework/modules/media';
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
    throw new Error('[Carousel] showPrivacyAlert failed');
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

const getUrlString = (src: FileMedia['src']): string | undefined => {
  if (src instanceof URL) return src.toString();
  if (typeof src === 'string') return src;
  return undefined;
};

const addThumbnailParam = (url: string, thumbnailSize: string): string => {
  if (url.includes('thumbnail=')) return url.replace(/thumbnail=[^&]*/, `thumbnail=${thumbnailSize}`);
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}thumbnail=${thumbnailSize}`;
};

export const getSignedPosterSource = (src: FileMedia['src'], thumbnailSize?: string): ImageURISource => {
  if (thumbnailSize) {
    const urlStr = getUrlString(src);
    if (urlStr) return getSignedMediaSource(addThumbnailParam(urlStr, thumbnailSize)) as ImageURISource;
  }
  return getSignedMediaSource(src) as ImageURISource;
};
