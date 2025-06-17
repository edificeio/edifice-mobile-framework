import { IMailsMailPreview } from '~/framework/modules/mails/model';

export interface MailsMailPreviewProps {
  data: IMailsMailPreview;
  isSender: boolean;
  isInPersonalFolder?: boolean;
  isSelected: boolean;
  isSelectMode: boolean;
  onSelect: (id: string) => void;
  onPress: () => void;
  onLongPress?: () => void;
  onDelete: (id: string) => void;
  onToggleUnread?: (id: string) => void;
  onRestore?: (id: string) => void;
}
