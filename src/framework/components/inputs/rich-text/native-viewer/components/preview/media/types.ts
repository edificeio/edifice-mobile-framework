import type { RichContentSegment, RichContentSegmentType } from '~/framework/components/inputs/rich-text/native-viewer/types';

export interface MediaPreviewProps {
  onOpenLink: (url: string) => void;
  onOpenMedia: (url: string) => void;
  segment: Extract<
    RichContentSegment,
    { type: RichContentSegmentType.AUDIO | RichContentSegmentType.IFRAME | RichContentSegmentType.VIDEO }
  >;
}
