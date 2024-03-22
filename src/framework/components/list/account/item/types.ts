import { FlatListProps, ListRenderItemInfo } from 'react-native';

import { SingleSourceAvatarSpecificProps } from '~/framework/components/avatar/types';
import type { AuthLoggedAccount, AuthSavedAccount } from '~/framework/modules/auth/model';

export interface AccountListItemProps<ItemT extends AuthSavedAccount | AuthLoggedAccount> extends ListRenderItemInfo<ItemT> {
  selected?: boolean;
  getAvatarSource?: (
    ...args: Parameters<NonNullable<FlatListProps<ItemT>['renderItem']>>
  ) => SingleSourceAvatarSpecificProps['source'] | undefined;
  onPress?: (item: ListRenderItemInfo<ItemT>['item'], index: number) => Promise<void>;
  onDelete?: (item: ListRenderItemInfo<ItemT>['item'], index: number) => Promise<void>;
}
