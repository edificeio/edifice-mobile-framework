import { AccountType } from '~/framework/modules/auth/model';

export interface AccountListItemProps {
  avatar: Blob;
  id: string;
  name: string;
  type: AccountType;
  selected?: boolean;
}
