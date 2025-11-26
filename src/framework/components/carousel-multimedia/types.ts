import { AudienceParameter } from '~/framework/modules/audience/types';
import { Media } from '~/framework/util/media';

export interface CarouselItem {
  media: Media[];
  startIndex?: number;
  referer: AudienceParameter;
}
