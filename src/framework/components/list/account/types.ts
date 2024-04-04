import { ListRenderItemInfo } from 'react-native';

import { AuthLoggedAccount, AuthSavedAccount } from '~/framework/modules/auth/model';

export interface AccountListProps<ItemT extends AuthSavedAccount | AuthLoggedAccount> {
  data: ItemT[];
  description: string;
  title: string;
  onPress?: (item: ListRenderItemInfo<ItemT>['item'], index: number) => Promise<void>;
  onDelete?: (item: ListRenderItemInfo<ItemT>['item'], index: number) => Promise<void>;
}
