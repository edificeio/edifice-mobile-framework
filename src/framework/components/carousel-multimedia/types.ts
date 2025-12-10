import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AudienceParameter } from '~/framework/modules/audience/types';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { Media } from '~/framework/util/media';

export interface CarouselItem {
  media: Media[];
  startIndex?: number;
  referer?: AudienceParameter;
}

export interface MultimediaCarouselProps extends NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.Carousel> {}
