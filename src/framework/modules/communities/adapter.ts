import { MediaDto, MediaType as MediaTypeDto } from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';

import {
  AttachmentMedia,
  AudioMedia,
  EmbeddedMedia,
  ImageMedia,
  LinkMedia,
  Media,
  MediaType,
  VideoMedia,
} from '~/framework/modules/media';

export const COMMUNITY_DEFAULT_THUMBNAIL_IMAGE_SIZE = {
  height: 130,
  width: 440,
};

export const toMedia = (media: MediaDto): Media => {
  switch (media.type) {
    case MediaTypeDto.IMAGE:
      return {
        mime: media.mimeType,
        name: media.name,
        src: media.url,
        type: MediaType.IMAGE,
      } as ImageMedia;
    case MediaTypeDto.AUDIO:
      return {
        mime: media.mimeType,
        name: media.name,
        src: media.url,
        type: MediaType.AUDIO,
      } as AudioMedia;
    case MediaTypeDto.VIDEO:
      return {
        mime: media.mimeType,
        name: media.name,
        src: media.url,
        type: MediaType.VIDEO,
      } as VideoMedia;
    case MediaTypeDto.EMBEDDER:
      return {
        mime: media.mimeType,
        name: media.name,
        src: media.url,
        type: MediaType.EMBEDDED,
      } as EmbeddedMedia;
    case MediaTypeDto.ATTACHMENT:
      return {
        mime: media.mimeType,
        name: media.name,
        src: media.url,
        type: MediaType.ATTACHMENT,
      } as AttachmentMedia;
    case MediaTypeDto.HYPERLINK:
      return {
        mime: media.mimeType,
        name: media.name,
        src: media.url,
        type: MediaType.LINK,
      } as LinkMedia;
  }
  return {
    src: media.url,
    type: MediaType.LINK,
  } as LinkMedia;
};

/** The DTOs declare `Date` but the REST client actually yields ISO strings. */
export const toInstant = (date?: Date | string): Temporal.Instant | undefined => {
  if (!date) return undefined;
  const epochMs = new Date(date).getTime();
  return Number.isNaN(epochMs) ? undefined : Temporal.Instant.fromEpochMilliseconds(epochMs);
};
