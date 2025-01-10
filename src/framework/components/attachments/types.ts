import { IMailsMailAttachment } from '~/framework/modules/mails/model';

export interface AttachmentsProps {
  isEditing?: boolean;
  attachments?: IMailsMailAttachment[];
}
