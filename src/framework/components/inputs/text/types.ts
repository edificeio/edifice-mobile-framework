import { TextInputProps as RNTextInputProps } from 'react-native';

export interface TextInputProps extends RNTextInputProps {
  annotation?: string;
  showError?: boolean;
  showSuccess?: boolean;
  showIconCallback?: boolean;
  toggleIconOn?: string;
  toggleIconOff?: string;
  disabled?: boolean;
  testIDToggle?: string;
  onToggle?: () => void;
}
