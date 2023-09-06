import { ColorValue } from 'react-native';

export interface PictureButtonProps {
  iconName: string;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
  pictureFill?: ColorValue;
}
