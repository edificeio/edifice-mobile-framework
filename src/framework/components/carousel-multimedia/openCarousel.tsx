import { useNavigation } from '@react-navigation/native';
import { ModalsRouteNames } from '~/framework/navigation/modals';
import { FileMedia } from '~/framework/util/media/types';

export interface MultimediaCarouselNavParams {
  startIndex: number;
  media: FileMedia[];
}

/**
 * @deprecated navigate directly (screens are now strongly typed)
 * @param props
 */
export function openMultimediaCarousel(props: MultimediaCarouselNavParams) {
  console.info('hook', useNavigation());
  useNavigation().navigate('media/carousel', props);
}
