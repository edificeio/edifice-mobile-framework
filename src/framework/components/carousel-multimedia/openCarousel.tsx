import { navigationRef } from '~/app/navigation';
import { FileMedia } from '~/framework/util/media/types';

export interface MultimediaCarouselNavParams {
  startIndex: number;
  media: FileMedia[];
  title?: string;
}

/**
 * @deprecated navigate directly (screens are now strongly typed)
 * @param props
 */
export function openMultimediaCarousel(props: MultimediaCarouselNavParams) {
  navigationRef.navigate('media/carousel', props);
}
