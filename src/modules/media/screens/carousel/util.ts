import type { ImageURISource } from 'react-native';

import type { Source } from 'react-native-pdf';
import type { ReactVideoSourceProperties } from 'react-native-video';

import { type FileMedia, isPdfContent, MediaType } from '~/modules/media/types';

/** What the items of the carousel read: not signed, the components that show it sign it (see `source.ts` of the module). */
export type CarouselSource = ImageURISource | ReactVideoSourceProperties | Source;

/**
 * The source of a media in the shape the component that shows it expects.
 */
export const getMediaSource = (item: FileMedia | FileMedia['src']): CarouselSource => {
  const isFullMedia = typeof item === 'object' && item !== null && 'src' in item;
  const src = isFullMedia ? item.src : item;
  const type = isFullMedia ? item.type : undefined;

  if (typeof src === 'string') return { uri: src };
  if (src instanceof URL) return { uri: src.toString() };
  if (type === MediaType.VIDEO || type === MediaType.AUDIO)
    return { uri: typeof src === 'string' ? src : src.uri } as ReactVideoSourceProperties;
  if (isFullMedia && type === MediaType.ATTACHMENT && isPdfContent(item as FileMedia)) return src as Source;
  return src as ImageURISource;
};

/**
 * The source of the thumbnail of a media: the same, with a thumbnail size when it can be asked.
 */
export const getPosterSource = (src: FileMedia['src'], thumbnailSize?: string): ImageURISource => {
  if (thumbnailSize) {
    const urlStr = src instanceof URL ? src.toString() : typeof src === 'string' ? src : undefined;
    if (urlStr) {
      // Replace existing thumbnail param in videos to fetch a smaller one or check the existence of params to choose between & and ?
      const thumbnailSrc = urlStr.includes('thumbnail=')
        ? urlStr.replace(/thumbnail=[^&]*/, `thumbnail=${thumbnailSize}`)
        : urlStr.includes('?')
          ? `${urlStr}&thumbnail=${thumbnailSize}`
          : `${urlStr}?thumbnail=${thumbnailSize}`;
      return getMediaSource(thumbnailSrc) as ImageURISource;
    }
  }
  return getMediaSource(src) as ImageURISource;
};
