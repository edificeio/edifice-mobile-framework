import { SharedValue } from 'react-native-reanimated';
import type { CarouselRef } from 'react-native-reanimated-carousel';

import { FileMedia } from '~/framework/modules/media/types';

export interface CarouselPaginationProps {
  bottomInset: number;
  carouselRef: React.RefObject<CarouselRef | null>;
  containerWidth: number;
  containerWidthShared: SharedValue<number>;
  isInitialAVMediaLoaded: boolean;
  isNavBarVisible: boolean;
  isPaginationVisible: boolean;
  media: FileMedia[];
  mediaLengthShared: SharedValue<number>;
  paginationProgress: SharedValue<number>;
  paginationTranslateY: SharedValue<number>;
  startIndex: number;
}
