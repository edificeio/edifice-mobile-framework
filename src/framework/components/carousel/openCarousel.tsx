import { CarouselParams } from './screen';

import { navigate } from '~/framework/navigation/helper';
import { ModalsRouteNames } from '~/framework/navigation/modals';

/**
 * @deprecated Use new carousel
 * @param props
 */
export function openCarousel(props: CarouselParams) {
  navigate(ModalsRouteNames.Carousel, props);
}
