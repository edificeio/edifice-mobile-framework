import { SharedValue } from 'react-native-reanimated';
import { ICarouselInstance } from 'react-native-reanimated-carousel';

import { FileMedia } from '~/framework/util/media/types';

export interface CarouselPaginationProps {
  bottomInset: number;
  carouselRef: React.RefObject<ICarouselInstance | null>;
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
