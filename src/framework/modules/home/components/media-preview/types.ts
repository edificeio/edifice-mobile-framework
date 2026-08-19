import type { INotificationMedia } from '~/framework/util/notifications';

export interface MediaPreviewProps {
  /** Media taken from an html content. */
  media: INotificationMedia[];
  /** Shows the videos too. The news zone leaves it out: its spec only asks for images. */
  withVideos?: boolean;
}

/** A video gives the id and the size of its file, which its still is computed from. */
export type PreviewMedia = INotificationMedia & { 'document-id'?: string; 'video-resolution'?: string };
