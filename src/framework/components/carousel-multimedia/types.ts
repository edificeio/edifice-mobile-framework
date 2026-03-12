import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CarouselRenderItemInfo } from 'react-native-reanimated-carousel/lib/typescript/types';

import { SignedMediaSource } from './util';

import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { FileMedia } from '~/framework/util/media';

export interface CarouselItemProps {
  currentIndex: number;
  hideNavBar: () => void;
  info?: CarouselRenderItemInfo<FileMedia>;
  isCurrentMediaUnknown: boolean;
  isNavBarVisible: boolean;
  itemSource: SignedMediaSource;
  onInitialAVMediaLoad?: () => void;
  setIsCarouselSwipeEnabled: (isEnabled: boolean) => void;
  showNavBar: () => void;
  startIndex?: number;
  toggleNavBarVisibility: () => void;
}

export interface MultimediaCarouselProps extends NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.Carousel> {}
