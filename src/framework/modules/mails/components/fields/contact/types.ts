import { MailsRecipientInfo, MailsRecipientsType } from '~/framework/modules/mails/model';

export interface MailsContactFieldProps {
  type: MailsRecipientsType;
  recipients: MailsRecipientInfo[];
  isOpenMoreRecipientsFields?: boolean;
  onDelete: (id: string) => void;
  onToggleMoreRecipientsFields?: () => void;
}
