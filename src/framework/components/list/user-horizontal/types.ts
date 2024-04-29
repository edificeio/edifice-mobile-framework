import type * as React from 'react';
import { DimensionValue, GestureResponderEvent, ListRenderItemInfo } from 'react-native';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

import { HorizontalListProps } from '~/framework/components/list/horizontal/types';
import { DisplayUserPublic } from '~/framework/modules/auth/model';

export type UserListItemProps<ItemT extends DisplayUserPublic = DisplayUserPublic> = ListRenderItemInfo<ItemT> &
  Pick<UserListProps<ItemT>, 'renderUserDetails'> &
  Pick<ViewProps, 'style'>;

export interface UserListProps<ItemT extends DisplayUserPublic = DisplayUserPublic>
  extends Omit<HorizontalListProps<ItemT>, 'renderItem'> {
  size?: 'small' | 'large' | DimensionValue;
  centered?: boolean;
  onItemPress?: (item: ItemT, index: number, event: GestureResponderEvent) => void;
  renderUserDetails?: HorizontalListProps<ItemT>['renderItem'];
  itemContainerStyle?: ViewProps['style'];
  userItemComponent?: React.ComponentType<UserListItemProps<ItemT>>;
}
