import { SignedMediaSource } from '~/framework/components/carousel/utils';
import { FileMedia } from '~/framework/modules/media';

export interface CarouselItemProps {
  containerHeight: number;
  containerWidth: number;
  hideNavBar: () => void;
  index: number;
  isCurrentItem: boolean;
  isNavBarVisible: boolean;
  item: FileMedia;
  itemSource: SignedMediaSource;
  onInitialAVMediaLoad?: () => void;
  setHasMediaError: (index: number) => void;
  setIsCarouselSwipeEnabled: (isEnabled: boolean) => void;
  showNavBar: () => void;
  toggleNavBarVisibility: () => void;
}
