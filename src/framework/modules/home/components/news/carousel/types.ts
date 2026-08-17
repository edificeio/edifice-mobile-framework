import type { HorizontalListProps } from '~/framework/components/list/horizontal';

export interface CarouselProps<ItemT> extends Omit<HorizontalListProps<ItemT>, 'contentContainerStyle' | 'style'> {
  /** Space between two items. */
  gap?: number;
  /** Padding of the screen the carousel runs across, so its items scroll from edge to edge. */
  edgeInset?: number;
}
