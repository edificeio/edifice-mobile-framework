import type { FlashListProps } from '@shopify/flash-list';

import type { SwipeRowAction } from '~/framework/components/list/swipeable/row';

export interface SwipeableListRenderItemInfo<ItemT> {
  // wraps the row's own press: while a row is open, a tap on a pressable row only closes it.
  guardPress: (onPress?: () => void) => (() => void) | undefined;
  index: number;
  item: ItemT;
}

export interface SwipeableListProps<ItemT> extends Omit<
  FlashListProps<ItemT>,
  'keyExtractor' | 'ListFooterComponent' | 'renderItem'
> {
  getSwipeActions?: (item: ItemT) => readonly SwipeRowAction[];
  keyExtractor: (item: ItemT) => string;
  ListFooterComponent?: React.ReactElement | null;
  onSwipeActiveChange?: (active: boolean) => void;
  renderItem: (info: SwipeableListRenderItemInfo<ItemT>) => React.ReactElement | null;
}
