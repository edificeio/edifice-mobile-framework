import { AccountListProps } from '~/framework/components/list/account/types';

import { AuthLoggedAccount, AuthSavedAccount } from '../../model';

export type HandleAccountListProps<ItemT extends AuthSavedAccount | AuthLoggedAccount> = Pick<
  AccountListProps<ItemT>,
  'data' | 'getAvatarSource'
>;
