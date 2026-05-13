import { navigate } from '~/framework/navigation/helper';
import { ModalsRouteNames } from '~/framework/navigation/modals';
import { FileMedia } from '~/framework/util/media/types';

export interface MultimediaCarouselNavParams {
  startIndex: number;
  media: FileMedia[];
}

export function openMultimediaCarousel(props: MultimediaCarouselNavParams) {
  navigate(ModalsRouteNames.CarouselMultimedia, props);
}
