import type { FlashListProps } from '@shopify/flash-list';

import type { SwipeRowAction } from '~/framework/components/list/swipeable/row';

export interface SwipeableFlashListRenderItemInfo<ItemT> {
  index: number;
  item: ItemT;
}

export interface SwipeableFlashListProps<ItemT> extends Omit<
  FlashListProps<ItemT>,
  'keyExtractor' | 'ListFooterComponent' | 'renderItem'
> {
  getSwipeActions?: (item: ItemT) => readonly SwipeRowAction[];
  keyExtractor: (item: ItemT) => string;
  ListFooterComponent?: React.ReactElement | null;
  onSwipeActiveChange?: (active: boolean) => void;
  renderItem: (info: SwipeableFlashListRenderItemInfo<ItemT>) => React.ReactElement | null;
}
