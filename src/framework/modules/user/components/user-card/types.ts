import { AccountType } from '~/framework/modules/auth/model';
import { LocalFile } from '~/framework/util/fileHandler/models';

export interface IUserCardProps {
  id: string;
  displayName: string;
  type: AccountType;
  canEdit: boolean;
  hasAvatar: boolean;
  updatingAvatar?: boolean;
  onPressInlineButton?: () => void;
  onChangeAvatar?: (image: LocalFile) => void;
  onDeleteAvatar?: () => void;
}
