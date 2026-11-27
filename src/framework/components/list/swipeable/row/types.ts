import type { ColorValue } from 'react-native';

import type { FlashListProps, ListRenderItemInfo } from '@shopify/flash-list';

import type { SvgIconName } from '~/framework/components/picture';

export interface SwipeRowAction {
  color: ColorValue;
  filled?: boolean;
  icon: SvgIconName;
  label: string;
  // the row closes once the returned promise settles.
  onPress: () => void | Promise<unknown>;
  testID: string;
}

// the row builds its own content and actions, so that its props stay the same while another row opens.
// it gets the values FlashList gives to renderItem, to hand them on.
export interface SwipeRowProps<ItemT> extends ListRenderItemInfo<ItemT> {
  getSwipeActions?: (item: ItemT) => readonly SwipeRowAction[];
  id: string;
  isRowOpened: boolean;
  renderItem: NonNullable<FlashListProps<ItemT>['renderItem']>;
}
