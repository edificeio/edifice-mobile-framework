import { AccountType } from '~/framework/modules/auth/model';

export interface AccountListItemProps {
  // avatar: Blob;
  id: string;
  displayName: string;
  type: AccountType;
  selected?: boolean;
}
