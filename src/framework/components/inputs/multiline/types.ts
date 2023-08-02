import { TextInputProps } from '~/framework/components/inputs/text';

export interface MultilineTextInputProps extends Omit<TextInputProps, 'toggleIconOn' | 'toggleIconOff' | 'numberOfLines'> {
  numberOfLines: number;
}
