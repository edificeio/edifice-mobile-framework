import { CarouselRenderItemInfo } from 'react-native-reanimated-carousel/lib/typescript/types';

import { FileMedia } from '~/modules/media/types';

import { CarouselSource } from './util';

export interface CarouselItemProps {
  containerHeight: number;
  containerWidth: number;
  currentIndex: number;
  hideNavBar: () => void;
  info?: CarouselRenderItemInfo<FileMedia>;
  isNavBarVisible: boolean;
  itemSource: CarouselSource;
  onInitialAVMediaLoad?: () => void;
  setHasMediaError: (index: number) => void;
  setIsCarouselSwipeEnabled: (isEnabled: boolean) => void;
  showNavBar: () => void;
  startIndex?: number;
  toggleNavBarVisibility: () => void;
}
