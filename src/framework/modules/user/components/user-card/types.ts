import { MenuAction, NativeActionEvent } from '@react-native-menu/menu';

import { AccountType } from '~/framework/modules/auth/model';
import { LocalFile } from '~/framework/util/fileHandler/models';
import { IAvatarProps } from '~/ui/avatars/Avatar';

export interface IUserCardProps {
  id: IAvatarProps['sourceOrId'];
  displayName: string;
  type: AccountType;
  canEdit: boolean;
  hasAvatar: boolean;
  updatingAvatar?: boolean;
  onPressMessageAction?: (e?: NativeActionEvent) => void;
  onChangeAvatar?: (image: LocalFile) => void;
  onDeleteAvatar?: () => void;
  messageActions?: MenuAction[];
}
