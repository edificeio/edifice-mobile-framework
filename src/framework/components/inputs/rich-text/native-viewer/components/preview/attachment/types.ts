import type { RichContentAttachment } from '~/framework/components/inputs/rich-text/native-viewer/types';

export interface AttachmentPreviewProps {
  attachment: RichContentAttachment;
  onPress: (url: string) => void;
}
