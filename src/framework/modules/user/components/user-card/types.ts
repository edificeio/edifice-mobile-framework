import { ImagePicked } from '~/framework/components/menus/actions';
import { AccountType } from '~/framework/modules/auth/model';

export interface IUserCardProps {
  id: string;
  displayName: string;
  type: AccountType;
  canEdit: boolean;
  hasAvatar: boolean;
  updatingAvatar?: boolean;
  onPressInlineButton?: () => void;
  onChangeAvatar?: (image: ImagePicked) => void;
  onDeleteAvatar?: () => void;
}
