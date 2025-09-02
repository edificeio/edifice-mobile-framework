import { MailsEditType } from '~/framework/modules/mails/screens/edit';

export interface MailsSubjectFieldProps {
  subject?: string;
  type?: MailsEditType;
  onChangeText: (text: string) => void;
}
