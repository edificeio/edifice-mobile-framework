import { ImagePicked } from '~/framework/components/menus/actions';
import { UserType } from '~/framework/modules/auth/service';

export interface IUserCardProps {
  id: string;
  displayName: string;
  type: UserType;
  canEdit: boolean;
  hasAvatar: boolean;
  updatingAvatar?: boolean;
  onPressInlineButton?: () => void;
  onChangeAvatar?: (image: ImagePicked) => void;
  onDeleteAvatar?: () => void;
}
