import { IMailsMailPreview } from '~/framework/modules/mails/model';

export interface MailsMailPreviewProps {
  data: IMailsMailPreview;
  isSender: boolean;
  onPress: () => void;
  onDelete: (id: string) => void;
  onUnread?: (id: string) => void;
  onRestore?: (id: string) => void;
}
