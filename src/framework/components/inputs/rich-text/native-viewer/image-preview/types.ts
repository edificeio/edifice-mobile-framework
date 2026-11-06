import type { ImageSize } from '~/framework/components/inputs/rich-text/native-viewer/types';

export interface ImagePreviewProps {
  declaredSize?: ImageSize;
  onPress: (url: string) => void;
  src: string;
}
