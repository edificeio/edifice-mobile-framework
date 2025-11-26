import { ICarouselNavParams } from './screen';

import { navigate } from '~/framework/navigation/helper';
import { ModalsRouteNames } from '~/framework/navigation/modals';

export function openCarousel(props: ICarouselNavParams) {
  navigate(ModalsRouteNames.Carousel, props);
}
