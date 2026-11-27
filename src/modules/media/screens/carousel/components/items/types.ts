import type { CarouselSource } from '~/modules/media/screens/carousel/utils';
import { FileMedia } from '~/modules/media/types';

export interface CarouselItemProps {
  containerHeight: number;
  containerWidth: number;
  hideNavBar: () => void;
  index: number;
  isCurrentItem: boolean;
  isNavBarVisible: boolean;
  item: FileMedia;
  itemSource: CarouselSource;
  onInitialAVMediaLoad?: () => void;
  setHasMediaError: (index: number) => void;
  setIsCarouselSwipeEnabled: (isEnabled: boolean) => void;
  showNavBar: () => void;
  toggleNavBarVisibility: () => void;
}
