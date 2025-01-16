import { MailsRecipientsType, MailsVisible } from '~/framework/modules/mails/model';

export interface MailsContactFieldProps {
  type: MailsRecipientsType;
  recipients: MailsVisible[];
  visibles: MailsVisible[];
  hideCcCciButton?: boolean;
  onChangeRecipient: (selectedRecipients: MailsVisible[], type: MailsRecipientsType) => void;
  onBlur: (visibles: MailsVisible[]) => void;
  onOpenMoreRecipientsFields?: () => void;
}
