import { ListRenderItemInfo } from 'react-native';

import { AccountListProps } from '~/framework/components/list/account/types';
import { AuthLoggedAccount, AuthSavedAccount } from '~/framework/modules/auth/model';

export interface ChangeAccountListDispatchProps<ItemT extends AuthSavedAccount | AuthLoggedAccount> {
  onPress: (item: ListRenderItemInfo<ItemT>['item'], index: number) => Promise<void>;
}

export interface ChangeAccountListProps<ItemT extends AuthSavedAccount | AuthLoggedAccount>
  extends Pick<AccountListProps<ItemT>, 'data'>,
    ChangeAccountListDispatchProps<ItemT> {}
