import { TextInputProps } from '~/framework/components/inputs/text';

export interface SearchInputProps
  extends Omit<TextInputProps, 'showError' | 'showSuccess' | 'showStatusIcon' | 'toggleIconOn' | 'toggleIconOff'> {
  onClear?: () => void;
}
