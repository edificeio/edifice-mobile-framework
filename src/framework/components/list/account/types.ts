import { AuthLoggedAccount, AuthSavedAccount } from '~/framework/modules/auth/model';

export interface AccountListProps {
  data: (AuthSavedAccount | AuthLoggedAccount)[];
  description: string;
  title: string;
}
