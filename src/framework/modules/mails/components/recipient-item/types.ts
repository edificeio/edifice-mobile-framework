import { MailsRecipientGroupInfo, MailsRecipientInfo, MailsVisible } from '~/framework/modules/mails/model';

export interface MailsRecipientContainerProps {
  disabled?: boolean;
  selected?: boolean;
  onPress?: (recipients: MailsVisible[]) => void;
  item: MailsRecipientInfo | MailsRecipientGroupInfo | MailsVisible;
}
