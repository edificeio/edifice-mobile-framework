import { ColorValue, TouchableOpacityProps } from 'react-native';

export interface DefaultButtonProps extends TouchableOpacityProps {
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
