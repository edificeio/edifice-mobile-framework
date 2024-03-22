import { AccountListProps } from '~/framework/components/list/account/types';
import { AuthLoggedAccount, AuthSavedAccount } from '~/framework/modules/auth/model';

export type HandleAccountListProps<ItemT extends AuthSavedAccount | AuthLoggedAccount> = Pick<
  AccountListProps<ItemT>,
  'data' | 'onDelete'
>;
