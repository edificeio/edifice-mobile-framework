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

export interface RichContentTableCell {
  backgroundColor?: string;
  colspan: number;
  isHeader: boolean;
  // Empty cell filling the place of a cell with a rowspan of a previous row: drawn without a top border, to look merged
  isRowspanFiller?: boolean;
  segments: RichContentSegment[];
}

export type RichContentSegment =
  | { type: RichContentSegmentType.ATTACHMENTS; items: RichContentAttachment[] }
  | { type: RichContentSegmentType.AUDIO; src: string }
  | { type: RichContentSegmentType.HTML; html: string }
  | { type: RichContentSegmentType.IFRAME; src: string }
  | ({ type: RichContentSegmentType.IMAGE } & RichContentImage)
  | { type: RichContentSegmentType.LATEX; latex: string }
  // A pane needs a second split to render its content (e.g medias), so it has segments too
  | { type: RichContentSegmentType.PANE; paneType: RichContentPaneType; segments: RichContentSegment[] }
  // Each cell content is split too. A column width is undefined when the html does not declare it.
  | { type: RichContentSegmentType.TABLE; columnWidths: (number | undefined)[]; rows: RichContentTableCell[][] }
  | { type: RichContentSegmentType.VIDEO; posterUri?: string; ratio?: number; src: string };

export enum RichContentSegmentType {
  ATTACHMENTS = 'attachments',
  AUDIO = 'audio',
  HTML = 'html',
  IFRAME = 'iframe',
  IMAGE = 'image',
  LATEX = 'latex',
  PANE = 'pane',
  TABLE = 'table',
  VIDEO = 'video',
}

export enum RichContentPaneType {
  INFO = 'info',
  QUESTION = 'question',
  SUCCESS = 'success',
  WARNING = 'warning',
}

export interface RichEditorNativeViewerProps {
  content: string;
}
