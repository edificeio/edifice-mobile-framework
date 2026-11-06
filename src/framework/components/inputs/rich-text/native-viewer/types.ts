import type { ColorValue } from 'react-native';

export interface ImageSize {
  height: number;
  width: number;
}

export interface RichContentAttachment {
  href: string;
  mime?: string;
  name: string;
}

export interface RichContentImage {
  // Size declared in the html (width/height attributes), when available
  declaredSize?: ImageSize;
  src: string;
}

export type RichContentSegment =
  | { type: RichContentSegmentType.ATTACHMENTS; items: RichContentAttachment[] }
  | { type: RichContentSegmentType.AUDIO; src: string }
  | { type: RichContentSegmentType.HTML; html: string }
  | { type: RichContentSegmentType.IFRAME; src: string }
  | ({ type: RichContentSegmentType.IMAGE } & RichContentImage)
  // A pane needs a second split to render its content (e.g medias), so it has segments too
  | { type: RichContentSegmentType.PANE; paneType: RichContentPaneType; segments: RichContentSegment[] }
  | { type: RichContentSegmentType.VIDEO; posterUri?: string; ratio?: number; src: string };

export enum RichContentSegmentType {
  ATTACHMENTS = 'attachments',
  AUDIO = 'audio',
  HTML = 'html',
  IFRAME = 'iframe',
  IMAGE = 'image',
  PANE = 'pane',
  VIDEO = 'video',
}

export enum RichContentPaneType {
  INFO = 'info',
  QUESTION = 'question',
  SUCCESS = 'success',
  WARNING = 'warning',
}

export interface RichEditorNativeViewerProps {
  backgroundColor?: ColorValue;
  content: string;
}
