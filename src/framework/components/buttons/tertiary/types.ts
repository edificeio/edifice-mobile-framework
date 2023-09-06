import { ColorValue } from 'react-native';

export interface TertiaryButtonProps {
  text: string;
  iconName?: string;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
  pictureFill?: ColorValue;
}
