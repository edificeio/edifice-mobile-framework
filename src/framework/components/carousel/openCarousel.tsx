import { CarouselParams } from './screen';

import { navigate } from '~/framework/navigation/helper';
import { ModalsRouteNames } from '~/framework/navigation/modals';

export function openCarousel(props: CarouselParams) {
  navigate(ModalsRouteNames.Carousel, props);
}
