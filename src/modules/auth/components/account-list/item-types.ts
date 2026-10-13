import { FlatListProps, ListRenderItemInfo } from 'react-native';

import { SingleSourceAvatarSpecificProps } from '~/framework/components/avatar/types';
import type { AuthActiveAccount, AuthSavedAccount } from '~/modules/auth/model';

type Account = AuthSavedAccount | AuthActiveAccount;
export interface AccountListItemProps<ItemT extends Account> extends ListRenderItemInfo<ItemT> {
  selected?: boolean;
  getAvatarSource?: (
    ...args: Parameters<NonNullable<FlatListProps<ItemT>['renderItem']>>
  ) => SingleSourceAvatarSpecificProps['source'] | undefined;
  onPress?: (item: ListRenderItemInfo<ItemT>['item'], index: number) => Promise<void>;
  onDelete?: (item: ListRenderItemInfo<ItemT>['item'], index: number) => Promise<void>;
}
