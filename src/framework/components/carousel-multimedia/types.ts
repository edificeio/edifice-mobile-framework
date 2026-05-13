import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CarouselRenderItemInfo } from 'react-native-reanimated-carousel/lib/typescript/types';

import { SignedMediaSource } from './util';

import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { FileMedia } from '~/framework/util/media';

export interface CarouselItemProps {
  containerHeight: number;
  containerWidth: number;
  currentIndex: number;
  hideNavBar: () => void;
  info?: CarouselRenderItemInfo<FileMedia>;
  isNavBarVisible: boolean;
  itemSource: SignedMediaSource;
  onInitialAVMediaLoad?: () => void;
  setHasMediaError: (hasError: boolean) => void;
  setIsCarouselSwipeEnabled: (isEnabled: boolean) => void;
  showNavBar: () => void;
  startIndex?: number;
  toggleNavBarVisibility: () => void;
}

export interface MultimediaCarouselProps extends NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.Carousel> {}
