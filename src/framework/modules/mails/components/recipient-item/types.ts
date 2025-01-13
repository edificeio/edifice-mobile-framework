import { MailsRecipientGroupInfo, MailsRecipientInfo } from '../../model';

export interface MailsRecipientItemProps {
  disabled?: boolean;
}

export interface MailsRecipientUserItemProps extends MailsRecipientItemProps {
  item: MailsRecipientInfo;
}

export interface MailsRecipientGroupItemProps extends MailsRecipientItemProps {
  item: MailsRecipientGroupInfo;
}
