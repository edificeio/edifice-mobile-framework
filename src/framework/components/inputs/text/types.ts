import { TextInputProps as RNTextInputProps } from 'react-native';

export interface TextInputProps extends RNTextInputProps {
  annotation?: string;
  showError?: boolean;
  showSuccess?: boolean;
  toggleIconOn?: string;
  toggleIconOff?: string;
  disabled?: boolean;
  onToggle?: () => void;
}