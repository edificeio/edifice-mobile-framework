import { MailsRecipientGroupInfo, MailsRecipientInfo, MailsVisible } from '../../model';

export interface MailsRecipientItemProps {
  disabled?: boolean;
  onPress?: () => void;
}

export interface MailsRecipientUserItemProps extends MailsRecipientItemProps {
  item: MailsRecipientInfo | MailsVisible; //TODO: lea conflit à revoir
}

export interface MailsRecipientGroupItemProps extends MailsRecipientItemProps {
  item: MailsRecipientGroupInfo | MailsVisible; //TODO: lea conflit à revoir
}
