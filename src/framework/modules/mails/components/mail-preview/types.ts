import { IMailsMailPreview } from '~/framework/modules/mails/model';

export interface MailsMailPreviewProps {
  data: IMailsMailPreview;
  isSender: boolean;
  onPress: () => void;
}
