import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { IDistantFileWithId } from '~/framework/util/fileHandler';

export interface AttachmentsProps {
  session: AuthActiveAccount;
  isEditing?: boolean;
  attachments?: IDistantFileWithId[];
}
