import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { IDistantFileWithId, SyncedFileWithId } from '~/framework/util/fileHandler';

export interface AttachmentsProps {
  session: AuthActiveAccount;
  isEditing?: boolean;
  attachments?: IDistantFileWithId[];
  draftId?: string;
  addAttachmentAction?: (attachment: IDistantFileWithId) => Promise<SyncedFileWithId>;
  removeAttachmentAction?: (attachment: IDistantFileWithId) => Promise<void>;
  onPressAddAttachments?: () => void;
}
