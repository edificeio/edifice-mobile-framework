import { IMailsMailPreview } from '~/framework/modules/mails/model';

export interface MailsMailPreviewProps {
  data: IMailsMailPreview;
  isSender: boolean;
  isInPersonalFolder?: boolean;
  isSelected: boolean;
  isSelectMode: boolean;
  isTrashed: boolean;
  onSelect: (id: string) => void;
  onPress: () => void;
  onLongPress?: () => void;
}
