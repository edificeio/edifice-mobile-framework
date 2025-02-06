import { ScrollView } from 'react-native';
import { MailsRecipientsType, MailsVisible } from '~/framework/modules/mails/model';

export interface MailsContactFieldProps {
  type: MailsRecipientsType;
  recipients: MailsVisible[];
  visibles: MailsVisible[];
  richEditorRef: React.RefObject<ScrollView>;
  inputFocused: MailsRecipientsType | null;
  isStartScroll: boolean;
  allInputsSelectedRecipients: string[];
  hideCcCciButton?: boolean;
  onChangeRecipient: (selectedRecipients: MailsVisible[], type: MailsRecipientsType, userId: string) => void;
  onFocus: (type: MailsRecipientsType) => void;
  onOpenMoreRecipientsFields?: () => void;
  onToggleShowList: (showList: boolean) => void;
}
