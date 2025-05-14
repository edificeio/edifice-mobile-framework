import { ScrollView } from 'react-native';

import { MailsRecipientsType, MailsVisible } from '~/framework/modules/mails/model';

export interface MailsContactFieldProps {
  type: MailsRecipientsType;
  recipients: MailsVisible[];
  richEditorRef: React.RefObject<ScrollView>;
  inputFocused: MailsRecipientsType | null;
  isStartScroll: boolean;
  isAdml: boolean;
  hideCcCciButton?: boolean;
  onChangeRecipient: (selectedRecipients: MailsVisible[], type: MailsRecipientsType) => void;
  onFocus: (type: MailsRecipientsType) => void;
  onOpenMoreRecipientsFields?: () => void;
  onToggleShowList: (showList: boolean) => void;
}
