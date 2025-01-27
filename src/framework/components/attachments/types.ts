import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { IDistantFileWithId, SyncedFileWithId } from '~/framework/util/fileHandler';

export interface AttachmentsProps {
  session: AuthActiveAccount;
  isEditing?: boolean;
  attachments?: IDistantFileWithId[];
  addAttachmentAction?: (attachment: IDistantFileWithId) => Promise<SyncedFileWithId>;
  removeAttachmentAction?: (attachment: IDistantFileWithId) => Promise<void>;
}
