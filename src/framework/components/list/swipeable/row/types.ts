import type { ColorValue } from 'react-native';

import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import type { SwipeableListRenderItemInfo } from '~/framework/components/list/swipeable/types';
import type { SvgIconName } from '~/framework/components/picture';

export interface SwipeRowAction {
  color: ColorValue;
  filled?: boolean;
  icon: SvgIconName;
  label: string;
  // the row closes once the returned promise settles.
  onPress: () => void | Promise<unknown>;
  testID?: string;
}

// the row builds its own content and actions, so that its props stay the same while another row opens.
export interface SwipeRowProps<ItemT> {
  getSwipeActions?: (item: ItemT) => readonly SwipeRowAction[];
  guardPress: SwipeableListRenderItemInfo<ItemT>['guardPress'];
  id: string;
  index: number;
  isRowOpened: boolean;
  item: ItemT;
  onClose: (id: string) => void;
  onOpen: (id: string) => void;
  onRef: (id: string, row: SwipeableMethods | null) => void;
  onSwipeActive: (active: boolean) => void;
  onWillOpen: (id: string) => void;
  renderItem: (info: SwipeableListRenderItemInfo<ItemT>) => React.ReactElement | null;
}
