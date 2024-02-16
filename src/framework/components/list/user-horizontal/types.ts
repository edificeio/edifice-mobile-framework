import { DimensionValue, GestureResponderEvent, ListRenderItemInfo } from 'react-native';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

import { DisplayUserPublic } from '~/framework/modules/auth/model';

import { HorizontalListProps } from '../horizontal/types';

export interface UserListProps<ItemT extends DisplayUserPublic = DisplayUserPublic>
  extends Omit<HorizontalListProps<ItemT>, 'renderItem'> {
  size?: 'small' | 'large' | DimensionValue;
  centered?: boolean;
  onItemPress?: (item: ItemT, index: number, event: GestureResponderEvent) => void;
  renderUserDetails?: HorizontalListProps<ItemT>['renderItem'];
  itemContainerStyle?: ViewProps['style'];
}

export type UserListItemProps<ItemT extends DisplayUserPublic = DisplayUserPublic> = ListRenderItemInfo<ItemT>;
