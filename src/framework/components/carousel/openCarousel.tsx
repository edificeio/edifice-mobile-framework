import { navigationRef } from '~/app/navigation';
import { convertToMedia } from '~/framework/util/media-deprecated';

import { CarouselParams } from './screen';
import { MultimediaCarouselNavParams } from '../carousel-multimedia/openCarousel';

/**
 * @deprecated Use new carousel
 * @param props
 */
export function openCarousel(props: CarouselParams) {
  const params: MultimediaCarouselNavParams = { media: convertToMedia(props.data), startIndex: props.startIndex ?? 0 };
  navigationRef.navigate('media/carousel', params);
  // navigate(ModalsRouteNames.Carousel, props);
}
