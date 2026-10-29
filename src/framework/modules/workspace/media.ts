import type { FileMedia } from '~/modules/media/types';
import { toURISource } from '~/modules/media/util';

import type { IFile } from './reducer';

/** The url without its parameters. */
const normalizeUrl = (url: string) => url.split('?')[0];

/**
 * The files of the workspace, as medias the carousel can show. The sources are not signed: the components that show them do it.
 */
export const convertIFileToFileMedia = (files: IFile[]): FileMedia[] =>
  files
    .filter(file => file.url !== undefined)
    .map(file => {
      const type = file.contentType || '';
      const isImage = type.startsWith('image/');
      const isAudio = type.startsWith('audio/');
      const isVideo = type.startsWith('video/');

      return {
        mime: isImage ? 'image/*' : isAudio ? 'audio/*' : isVideo ? 'video/*' : file.contentType || 'application/octet-stream',
        name: file.name,
        src: normalizeUrl(toURISource(file.url!.toString()).uri || ''),
        type: isImage ? 'image' : isAudio ? 'audio' : isVideo ? 'video' : 'attachment',
      } as FileMedia;
    });
