import { MailsRecipientGroupInfo, MailsRecipientInfo, MailsVisible } from '../../model';

export interface MailsRecipientContainerProps {
  disabled?: boolean;
  selected?: boolean;
  onPress?: (recipients: MailsVisible[]) => void;
  item: MailsRecipientInfo | MailsRecipientGroupInfo | MailsVisible;
}
