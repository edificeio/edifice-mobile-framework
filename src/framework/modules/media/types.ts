import type { ImageURISource } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { ReactVideoSource } from 'react-native-video';

import { mimeCompare } from './mime';

export enum MediaType {
  // File medias
  AUDIO = 'audio', // File added as audio content
  IMAGE = 'image', // File added as image content
  VIDEO = 'video', // File added as video content
  OFFICE = 'office', // File added as interactive office content (for now displayed in OnlyOffice)
  ATTACHMENT = 'attachment', // File content without further information.
  // Redirected medias
  LINK = 'link', // HTTP link to any web location
  EMBEDDED = 'embedded', // HTTP link to any web location, displayed in a Webview component
  // ENT resource
  RESOURCE = 'resource', // Identifies an ENT resource with application & IDs.
}

export interface Media {
  type: MediaType;
  src: URL | Pick<ImageURISource, 'uri'> | string | ReactVideoSource;
  date?: Temporal.Instant;
  name?: string;
}

export interface FileMedia extends Media {
  type: MediaType.IMAGE | MediaType.VIDEO | MediaType.AUDIO | MediaType.OFFICE | MediaType.ATTACHMENT;
  mime: string;
  size?: number;
}

export const isFileMedia = (media: Media): media is FileMedia =>
  [MediaType.IMAGE, MediaType.VIDEO, MediaType.AUDIO, MediaType.OFFICE, MediaType.ATTACHMENT].includes(media.type);

export interface PlayableMedia extends FileMedia {
  type: MediaType.VIDEO | MediaType.AUDIO;
  poster?: Media['src'];
  duration?: number;
}

export const isPlayableMedia = (media: Media): media is PlayableMedia => [MediaType.VIDEO, MediaType.AUDIO].includes(media.type);

export interface AttachmentMedia extends FileMedia {
  type: MediaType.ATTACHMENT;
}

export const isAttachmentMedia = (media: Media): media is AttachmentMedia => media.type === MediaType.ATTACHMENT;

export interface AudioMedia extends PlayableMedia {
  type: MediaType.AUDIO;
}

export const isAudioMedia = (media: Media): media is AudioMedia => media.type === MediaType.AUDIO;

export interface OfficeMedia extends FileMedia {
  type: MediaType.OFFICE;
}

export const isOfficeMedia = (media: Media): media is OfficeMedia => media.type === MediaType.OFFICE;

export const isAudioContent = (item: FileMedia) => {
  return isAudioMedia(item) || (isAttachmentMedia(item) && mimeCompare(item.mime, 'audio/*') === 0);
};

export interface ImageMedia extends FileMedia {
  type: MediaType.IMAGE;
}

export const isImageMedia = (media: Media): media is ImageMedia => media.type === MediaType.IMAGE;

export interface VideoMedia extends PlayableMedia {
  type: MediaType.VIDEO;
  ratio?: number;
}

export const isVideoMedia = (media: Media): media is VideoMedia => media.type === MediaType.VIDEO;

export const isImageContent = (item: FileMedia) => {
  return isImageMedia(item) || (isAttachmentMedia(item) && mimeCompare(item.mime, 'image/*') === 0);
};

export const isVideoContent = (item: FileMedia) => {
  return isVideoMedia(item) || (isAttachmentMedia(item) && mimeCompare(item.mime, 'video/*') === 0);
};

export interface LinkMedia extends Media {
  type: MediaType.LINK;
  name?: string;
}

export const isLinkMedia = (media: Media): media is LinkMedia => media.type === MediaType.LINK;

export interface EmbeddedMedia extends Media {
  type: MediaType.EMBEDDED;
  mime?: string;
}

export const isEmbeddedMedia = (media: Media): media is EmbeddedMedia => media.type === MediaType.EMBEDDED;

export interface ResourceMedia extends Media {
  appName: string;
  resourceId: string;
  thumbnail?: Media['src'];
}

export const isResourceMedia = (media: Media): media is ResourceMedia => media.type === MediaType.RESOURCE;

export const isPdfContent = (item: FileMedia): item is AttachmentMedia => {
  return isAttachmentMedia(item) && mimeCompare(item.mime, 'application/pdf') === 0;
};
