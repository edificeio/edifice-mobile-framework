import { MailsEditType } from '~/framework/modules/mails/screens/edit';

export interface MailsObjectFieldProps {
  subject?: string;
  type?: MailsEditType;
  onChangeText: (text: string) => void;
}
