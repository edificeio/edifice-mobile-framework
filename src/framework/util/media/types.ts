import type { ImageURISource } from 'react-native';

import type { EntAppNameOrSynonym } from '~/app/intents';

export enum MediaType {
  // File medias
  ATTACHMENT = 'attachment', // Unknown file. Use provided mime type to handle correctly.
  AUDIO = 'audio', // Audio file that can be displayed in a thumbnail & player
  DOCUMENT = 'document', // Printable documents like text / pdf / office / etc
  IMAGE = 'image', // Image file that can be displayed in a thumbnail
  VIDEO = 'video', // Video file that can be displayed in a thumbnail & player
  // Redirected medias
  LINK = 'link', // HTTP link to any web location
  EMBEDDED = 'embedded', // HTTP link to any web location, displayed in a Webview component
  // ENT resource
  RESOURCE = 'resource', // Identifies an ENT resource with application & IDs.
}

export interface Media {
  type: MediaType;
  src: URL | Pick<ImageURISource, 'uri'> | string;
}

export interface FileMedia extends Media {
  type: MediaType.IMAGE | MediaType.VIDEO | MediaType.AUDIO | MediaType.DOCUMENT | MediaType.ATTACHMENT;
  alt?: string;
  mime: string;
  name?: string;
  size?: number;
}

export const isFileMedia = (media: Media): media is FileMedia =>
  [MediaType.IMAGE, MediaType.VIDEO, MediaType.AUDIO, MediaType.DOCUMENT, MediaType.ATTACHMENT].includes(media.type);

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

export interface DocumentMedia extends FileMedia {
  type: MediaType.DOCUMENT;
}

export const isDocumentMedia = (media: Media): media is DocumentMedia => media.type === MediaType.DOCUMENT;

export interface ImageMedia extends FileMedia {
  type: MediaType.IMAGE;
}

export const isImageMedia = (media: Media): media is ImageMedia => media.type === MediaType.IMAGE;

export interface VideoMedia extends PlayableMedia {
  type: MediaType.VIDEO;
  ratio?: number;
}

export const isVideoMedia = (media: Media): media is VideoMedia => media.type === MediaType.VIDEO;

export interface LinkMedia extends Media {
  type: MediaType.LINK;
  name?: string;
}

export const isLinkMedia = (media: Media): media is LinkMedia => media.type === MediaType.LINK;

export interface EmbeddedMedia extends Media {
  type: MediaType.EMBEDDED;
}

export const isEmbeddedMedia = (media: Media): media is EmbeddedMedia => media.type === MediaType.EMBEDDED;

export interface ResourceMedia extends Media {
  appName: Exclude<EntAppNameOrSynonym, 'workspace'>;
  resourceId: string;
  title: string;
  thumbnail?: Media['src'];
}

export const isResourceMedia = (media: Media): media is ResourceMedia => media.type === MediaType.RESOURCE;

export const toURISource = (src: Media['src']): typeof src extends undefined ? undefined : Pick<ImageURISource, 'uri'> =>
  src instanceof URL ? { uri: src.href } : typeof src === 'string' ? { uri: src } : src;

export const toImageURISourceArray = (srcs: Media['src'][]) => srcs.map(toURISource);
