import { MailsRecipientsType, MailsVisible } from '~/framework/modules/mails/model';

export interface MailsContactFieldProps {
  type: MailsRecipientsType;
  recipients: MailsVisible[];
  onToggleMoreRecipientsFields?: () => void;
  visibles: MailsVisible[];
}
