import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';

export interface ActionButtonProps {
  text: string;
  iconName?: string;
  emoji?: string;
  action?: () => void;
  url?: string;
  showConfirmation?: boolean;
  requireSession?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
  onLayout?: ((event: LayoutChangeEvent) => void) | undefined;
}
