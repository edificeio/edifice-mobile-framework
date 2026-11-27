import type { FileMedia } from '~/modules/media/types';
import { toURISource } from '~/modules/media/util';

import type { IFile } from './reducer';

/** The url without its parameters. */
const normalizeUrl = (url: string) => url.split('?')[0];

/** The kind of media (generic mime + media type) of a workspace content type. */
const getFileMediaKind = (contentType?: string): { mime: string; type: string } => {
  if (contentType?.startsWith('image/')) return { mime: 'image/*', type: 'image' };
  if (contentType?.startsWith('audio/')) return { mime: 'audio/*', type: 'audio' };
  if (contentType?.startsWith('video/')) return { mime: 'video/*', type: 'video' };
  return { mime: contentType || 'application/octet-stream', type: 'attachment' };
};

/**
 * The files of the workspace, as medias the carousel can show. The sources are not signed: the components that show them do it.
 */
export const convertIFileToFileMedia = (files: IFile[]): FileMedia[] =>
  files
    .filter(file => file.url !== undefined)
    .map(file => {
      const { mime, type } = getFileMediaKind(file.contentType);
      return {
        mime,
        name: file.name,
        src: normalizeUrl(toURISource(file.url!.toString()).uri || ''),
        type,
      } as FileMedia;
    });
