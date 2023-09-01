import type { ViewStyle } from 'react-native';

export interface RadioButtonProps {
  isChecked: boolean;
  isDisabled?: boolean;
  label?: string;
  size?: 'default' | 'small';
  style?: ViewStyle;
  onPress?: () => any;
}
