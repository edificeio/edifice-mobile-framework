import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { IDistantFileWithId } from '~/framework/util/fileHandler';

export interface AttachmentProps {
  data: IDistantFileWithId;
  session: AuthActiveAccount;
  isEditing?: boolean;
  removeAttachment?: (attachment: IDistantFileWithId) => Promise<void>;
}
