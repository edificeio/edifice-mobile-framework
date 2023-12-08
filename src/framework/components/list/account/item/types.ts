import { AccountTyoe } from '~/framework/modules/auth/model';

export interface AccountListItemProps {
  avatar: Blob;
  id: string;
  name: string;
  type: AccountTyoe;
  selected?: boolean;
}
