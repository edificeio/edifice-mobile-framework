import { ColorValue, Insets, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';

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
  pictureSize?: number;
  pictureFill?: ColorValue;
  pictureStyle?: StyleProp<ViewStyle>;
  textColor?: ColorValue;
  hitSlop?: Insets;
  testID?: string;
}
