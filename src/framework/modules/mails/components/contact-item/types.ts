import { AccountType } from '~/framework/modules/auth/model';

export interface MailsContactItemProps {
  name: string;
  type: AccountType;
  id: string;
  isEditing: boolean;
  onDelete: (id: string) => void;
}
