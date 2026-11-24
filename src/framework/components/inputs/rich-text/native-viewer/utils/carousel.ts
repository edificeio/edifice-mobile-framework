/**
 * Medias of the rich content opened in the multimedia carousel, built from the segments of `splitRichContent`.
 */
import { decode } from 'html-entities';

import { RichContentSegment, RichContentSegmentType } from '~/framework/components/inputs/rich-text/native-viewer/types';
import { FileMedia, MediaType } from '~/framework/modules/media';

import { getAbsoluteUrl } from './parser';

// Used to match a pressed media url with the medias built from the html
const getComparableUrl = (url: string, platformUrl?: string): string => {
  try {
    const parsedUrl = new URL(getAbsoluteUrl(decode(url), platformUrl));
    return `${parsedUrl.origin}${parsedUrl.pathname}`;
  } catch {
    return url;
  }
};

const getAttachmentMediaType = (mime?: string): FileMedia['type'] => {
  if (mime?.startsWith('image/')) return MediaType.IMAGE;
  if (mime?.startsWith('video/')) return MediaType.VIDEO;
  if (mime?.startsWith('audio/')) return MediaType.AUDIO;
  return MediaType.ATTACHMENT;
};

// Medias opened in the multimedia carousel, in document order. Iframes are opened as links instead.
export const buildCarouselMedias = (segments: RichContentSegment[]): FileMedia[] =>
  segments.flatMap((segment): FileMedia[] => {
    switch (segment.type) {
      case RichContentSegmentType.IMAGE:
        return [{ mime: 'image/*', src: segment.src, type: MediaType.IMAGE }];
      case RichContentSegmentType.VIDEO:
        return [{ mime: 'video/*', poster: segment.posterUri, src: segment.src, type: MediaType.VIDEO } as FileMedia];
      case RichContentSegmentType.AUDIO:
        return [{ mime: 'audio/*', src: segment.src, type: MediaType.AUDIO }];
      case RichContentSegmentType.ATTACHMENTS:
        return segment.items.map(item => ({
          mime: item.mime ?? 'application/octet-stream',
          name: item.name,
          src: item.href,
          type: getAttachmentMediaType(item.mime),
        }));
      case RichContentSegmentType.PANE:
        return buildCarouselMedias(segment.segments);
      case RichContentSegmentType.TABLE:
        return segment.rows.flat().flatMap(cell => buildCarouselMedias(cell.segments));
      default:
        return [];
    }
  });

export const findMediaIndex = (medias: FileMedia[], url: string, platformUrl?: string): number => {
  const comparableUrl = getComparableUrl(url, platformUrl);
  const index = medias.findIndex(
    media => typeof media.src === 'string' && getComparableUrl(media.src, platformUrl) === comparableUrl,
  );
  return Math.max(index, 0);
};
