import { navigationRef } from '~/app/navigation';
import type { MediaCarouselParams } from '~/modules/media/screens/carousel/screen';

/** @deprecated Use `MediaCarouselParams` of `~/modules/media/screens/carousel/screen`. */
export type MultimediaCarouselNavParams = MediaCarouselParams;

/**
 * @deprecated Use `useOpenMedia().openCarousel` of `~/modules/media/hooks` (or navigate directly: screens are now strongly typed).
 * @param props
 */
export function openMultimediaCarousel(props: MultimediaCarouselNavParams) {
  navigationRef.navigate('media/carousel', props);
}
