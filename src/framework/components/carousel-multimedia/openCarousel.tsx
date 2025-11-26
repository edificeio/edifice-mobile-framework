import { CarouselItemProps } from './types';

import { navigate } from '~/framework/navigation/helper';
import { ModalsRouteNames } from '~/framework/navigation/modals';

export function openMultimediaCarousel(props: CarouselItemProps) {
  navigate(ModalsRouteNames.CarouselMultimedia, props);
}
