import { ListRenderItemInfo } from 'react-native';

import type { AuthLoggedAccount, AuthSavedAccount } from '~/framework/modules/auth/model';

import type { AccountListProps } from '..';

export interface AccountListItemProps<ItemT extends AuthSavedAccount | AuthLoggedAccount> extends ListRenderItemInfo<ItemT> {
  selected?: boolean;
  getAvatarSource?: AccountListProps<ItemT>['getAvatarSource'];
  action?: (item: ListRenderItemInfo<ItemT>['item'], index: number) => Promise<void>;
}
