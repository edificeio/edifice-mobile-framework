/**
 * Media adapters for the carousel.
 * The carousel only accepts `FileMedia[]`: each source format gets its own converter here.
 */
import { FileMedia, isFileMedia, MediaType, toURISource } from '~/framework/modules/media';
import { IFile } from '~/framework/modules/workspace/reducer';
import { computeVideoThumbnail } from '~/framework/modules/workspace/service';
import { extractVideoResolution } from '~/framework/util/htmlParser/content';
import { convertToMedia, type IMedia } from '~/framework/util/media-deprecated';
import { INotificationMedia } from '~/framework/util/notifications';
import { sessionURISource } from '~/framework/util/transport/source';
import type { ILocalAttachment } from '~/ui/Attachment';

const normalizeUrl = (url: string) => url.split('?')[0];

// Maps a workspace content type to the carousel media kind (generic mime + media type).
const getFileMediaKind = (contentType?: string): { mime: string; type: string } => {
  if (contentType?.startsWith('image/')) return { mime: 'image/*', type: 'image' };
  if (contentType?.startsWith('audio/')) return { mime: 'audio/*', type: 'audio' };
  if (contentType?.startsWith('video/')) return { mime: 'video/*', type: 'video' };
  return { mime: contentType || 'application/octet-stream', type: 'attachment' };
};

// Notification media src can be a plain url or an `{ src: ImageURISource, alt }` object.
const getNotificationMediaUrl = (src: INotificationMedia['src']): string => {
  if (typeof src === 'string') return src;
  return src.src.uri ?? '';
};

const NOTIFICATION_MEDIA_MIME: Partial<Record<INotificationMedia['type'], string>> = {
  audio: 'audio/*',
  image: 'image/*',
};

// For workspace files
export const convertIFileToFileMedia = (files: IFile[]): FileMedia[] => {
  return files
    .filter(file => file.url !== undefined)
    .map(file => {
      const { mime, type } = getFileMediaKind(file.contentType);

      return {
        mime,
        name: file.name,
        src: normalizeUrl(sessionURISource(toURISource(file.url!.toString())).uri || ''),
        type,
      } as FileMedia;
    });
};

// For Timeline notifications
export const convertNotificationToFileMedia = (notificationMedias: INotificationMedia[]): FileMedia[] => {
  return notificationMedias
    .filter(media => ['image', 'audio', 'video', 'iframe'].includes(media.type))
    .map(media => {
      if (media.type === 'iframe') {
        const url = getNotificationMediaUrl(media.src);
        const src = url.startsWith('//') ? 'https:' + url : url;
        return { mime: MediaType.EMBEDDED, name: media.name, src, type: MediaType.EMBEDDED } as unknown as FileMedia;
      }
      return {
        mime: NOTIFICATION_MEDIA_MIME[media.type] ?? 'video/*',
        name: media.name,
        poster:
          media.type === 'video' && media['document-id'] && media['video-resolution']
            ? computeVideoThumbnail(media['document-id'], extractVideoResolution(media['video-resolution']) || undefined)
            : undefined,
        src: normalizeUrl(sessionURISource(toURISource(getNotificationMediaUrl(media.src))).uri || ''),
        type: media.type,
      } as FileMedia;
    });
};

// For a single image url (ex: form question choices)
export const convertImageUrlToFileMedia = (url: string): FileMedia => ({
  mime: 'image/*',
  src: url,
  type: MediaType.IMAGE,
});

// For a single pdf url (ex: legal documents)
export const convertPdfUrlToFileMedia = (url: string): FileMedia => ({
  mime: 'application/pdf',
  src: url,
  type: MediaType.ATTACHMENT,
});

// For local image attachments (ex: picked from camera or gallery)
export const convertLocalAttachmentToFileMedia = (attachments: ILocalAttachment[]): FileMedia[] =>
  attachments.map(attachment => ({
    mime: attachment.mime,
    src: { uri: attachment.uri },
    type: MediaType.IMAGE,
  }));

// For legacy medias (`IMedia` from media-deprecated)
export const convertLegacyMediaToFileMedia = (medias: IMedia[]): FileMedia[] => convertToMedia(medias).filter(isFileMedia);

// For a single playable source (audio, video, embed)
export const convertPlayableSourceToFileMedia = (
  source: FileMedia['src'],
  type: MediaType.AUDIO | MediaType.VIDEO | MediaType.EMBEDDED,
  mime: string = 'application/octet-stream',
): FileMedia => ({ mime, src: source, type }) as unknown as FileMedia;
