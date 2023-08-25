import { ColorValue, TouchableOpacityProps } from 'react-native';

export interface DefaultButtonProps extends Omit<TouchableOpacityProps, 'onPress' | 'onPressIn' | 'onPressOut'> {
  text?: string;
  iconLeft?: string;
  iconRight?: string;
  contentColor?: ColorValue;
  url?: string;
  showConfirmation?: boolean;
  requireSession?: boolean;
  loading?: boolean;
  round?: boolean;
  action?: () => void;
}
