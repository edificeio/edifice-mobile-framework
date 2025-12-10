import { CarouselItem } from './types';

import { navigate } from '~/framework/navigation/helper';
import { ModalsRouteNames } from '~/framework/navigation/modals';

export function openCarousel(props: CarouselItem) {
  navigate(ModalsRouteNames.Carousel, props);
}
