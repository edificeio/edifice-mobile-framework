import { UserType } from '~/framework/modules/auth/service';

export interface AccountListItemProps {
  avatar: Blob;
  id: string;
  name: string;
  type: UserType;
  selected?: boolean;
}
