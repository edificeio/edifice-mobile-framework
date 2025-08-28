import { MailsVisible } from '~/framework/modules/mails/model';

export interface MailsContactItemProps {
  isEditing: boolean;
  onDelete: (user: MailsVisible) => void;
  user: MailsVisible;
}
