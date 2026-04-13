import { OrientationLockerProps } from 'react-native-orientation-locker';
import { SharedValue } from 'react-native-reanimated';
import { ICarouselInstance } from 'react-native-reanimated-carousel';

import { FileMedia } from '~/framework/util/media/types';

export interface CarouselPaginationProps {
  carouselRef: React.RefObject<ICarouselInstance | null>;
  isInitialAVMediaLoaded: boolean;
  isNavBarVisible: boolean;
  isPaginationVisible: boolean;
  media: FileMedia[];
  mediaLengthShared: SharedValue<number>;
  orientationShared: SharedValue<OrientationLockerProps['orientation']>;
  paginationProgress: SharedValue<number>;
  paginationTranslateY: SharedValue<number>;
  startIndex: number;
}
