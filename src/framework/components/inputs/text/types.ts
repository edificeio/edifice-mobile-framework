import { ColorValue, TextInputProps as RNTextInputProps, TextStyle } from 'react-native';

export type TextInputStatusIconProps = Pick<TextInputProps, 'showError' | 'toggleIconOn' | 'toggleIconOff'>;

export interface TextInputCustomToggleIconProps
  extends Pick<TextInputProps, 'onToggle' | 'disabled' | 'testIDToggle'>,
    Required<Pick<TextInputProps, 'toggleIconOn' | 'toggleIconOff'>> {
  colorStatus?: ColorValue;
}

export interface TextInputMaxLengthIndicatorProps extends Pick<TextInputProps, 'maxLength'> {
  valueLength: number | undefined;
}

export type TextInputAnnotationProps = Pick<
  TextInputProps,
  'annotation' | 'annotationStyle' | 'showError' | 'showSuccess' | 'testIDCaption'
>;
export interface TextInputProps extends RNTextInputProps {
  annotation?: string;
  annotationStyle?: TextStyle;
  showError?: boolean;
  showSuccess?: boolean;
  showStatusIcon?: boolean;
  toggleIconOn?: string;
  toggleIconOff?: string;
  disabled?: boolean;
  testIDToggle?: string;
  testIDCaption?: string;
  onToggle?: () => void;
}
