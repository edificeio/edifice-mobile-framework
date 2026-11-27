import type { FlashListProps } from '@shopify/flash-list';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import type { SwipeRowAction } from '~/framework/components/list/swipeable/row';

export interface SwipeableFlashListProps<ItemT> extends FlashListProps<ItemT> {
  getSwipeActions?: (item: ItemT) => readonly SwipeRowAction[];
  // required: the key is also the id the list uses to find the open row.
  keyExtractor: (item: ItemT) => string;
  onSwipeActiveChange?: (active: boolean) => void;
  renderItem: NonNullable<FlashListProps<ItemT>['renderItem']>;
}

export interface SwipeRowsContextValue {
  closeOpenedRow: () => void;
  hasOpenedRow: () => boolean;
  onRowClosed: (id: string) => void;
  onRowOpened: (id: string) => void;
  onRowWillOpen: (id: string) => void;
  onSwipeActive: (active: boolean) => void;
  // lets the list close the previous row when another opens.
  registerRow: (id: string, row: SwipeableMethods | null) => void;
}
