import { FileMedia } from '~/framework/modules/media';

export interface CarouselNavParams {
  media: FileMedia[];
  /** Index of the media displayed first. @default 0 */
  startIndex?: number;
  title?: string;
}
