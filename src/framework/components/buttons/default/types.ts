import { TouchableOpacityProps } from 'react-native';
import { ColorValue, LayoutChangeEvent } from 'react-native';

export interface DefaultButtonProps extends TouchableOpacityProps {
  text?: string;
  iconLeft?: string;
  iconRight?: string;
  contentColor?: ColorValue;
  url?: string;
  showConfirmation?: boolean;
  requireSession?: boolean;
  loading?: boolean;
  onLayout?: ((event: LayoutChangeEvent) => void) | undefined;
  action?: () => void;
}
