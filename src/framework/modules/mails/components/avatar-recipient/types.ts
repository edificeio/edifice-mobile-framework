import { Size } from '~/framework/components/avatar';

export interface MailsRecipientAvatarProps {
  id?: string;
  type: string;
  size?: Size | keyof typeof Size;
}
