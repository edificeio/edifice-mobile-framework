import { MailsRecipientsType, MailsVisible } from '~/framework/modules/mails/model';

export interface MailsContactFieldProps {
  type: MailsRecipientsType;
  recipients: MailsVisible[];
  visibles: MailsVisible[];
  onChangeRecipient: (selectedRecipients: MailsVisible[], type: MailsRecipientsType) => void;
  onBlur: (visibles: MailsVisible[]) => void;
  onOpenMoreRecipientsFields?: () => void;
}
