import { MailsRecipientGroupInfo, MailsRecipientInfo, MailsVisible } from '../../model';

export interface MailsRecipientContainerProps {
  disabled?: boolean;
  selected?: boolean;
  onPress?: (recipient: MailsVisible) => void;
  item: MailsRecipientInfo | MailsRecipientGroupInfo | MailsVisible;
}
