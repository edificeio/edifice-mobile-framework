import { AccountListProps } from '~/framework/components/list/account/types';
import type { AuthLoggedAccount, AuthSavedAccount } from '~/modules/auth/model';

export type HandleAccountListProps<ItemT extends AuthSavedAccount | AuthLoggedAccount> = Pick<
  AccountListProps<ItemT>,
  'data' | 'onDelete'
>;
