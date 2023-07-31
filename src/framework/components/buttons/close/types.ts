import { ColorValue, ViewStyle } from 'react-native';

export interface CloseButtonProps {
  iconName?: string;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
  pictureFill?: ColorValue;
  size?: number;
  style?: ViewStyle;
}
