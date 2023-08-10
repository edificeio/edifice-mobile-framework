import { TextInputProps as RNTextInputProps, ViewStyle } from 'react-native';

export interface TextInputProps extends RNTextInputProps {
  annotation?: string;
  showError?: boolean;
  showSuccess?: boolean;
  toggleIconOn?: string;
  toggleIconOff?: string;
  disabled?: boolean;
  onToggle?: () => void;
}
