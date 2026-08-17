import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CarouselRenderItemInfo } from 'react-native-reanimated-carousel/lib/typescript/types';

import { FileMedia } from '~/framework/modules/media';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

import { SignedMediaSource } from './util';

export interface CarouselItemProps {
  containerHeight: number;
  containerWidth: number;
  currentIndex: number;
  hideNavBar: () => void;
  info?: CarouselRenderItemInfo<FileMedia>;
  isNavBarVisible: boolean;
  itemSource: SignedMediaSource;
  onInitialAVMediaLoad?: () => void;
  setHasMediaError: (index: number) => void;
  setIsCarouselSwipeEnabled: (isEnabled: boolean) => void;
  showNavBar: () => void;
  startIndex?: number;
  toggleNavBarVisibility: () => void;
}

export interface MultimediaCarouselProps extends NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.Carousel> {}
