import { ImagePicked } from '~/framework/components/popup-menu';

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
