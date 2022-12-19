import { ImagePicked } from '~/infra/filePicker';

export interface IUserCardProps {
  id: string;
  displayName: string;
  type: ('Student' | 'Relative' | 'Teacher' | 'Personnel' | 'Guest')[] | 'Student' | 'Relative' | 'Teacher' | 'Personnel' | 'Guest';
  canEdit: boolean;
  hasAvatar: boolean;
  updatingAvatar?: boolean;
  onChangeAvatar?: (image: ImagePicked) => void;
  onDeleteAvatar?: () => void;
}
