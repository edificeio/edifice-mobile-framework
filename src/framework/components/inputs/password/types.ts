import { TextInputProps } from '~/framework/components/inputs/text/types';

export type PasswordInputProps = Omit<TextInputProps, 'toggleIconOn' | 'toggleIconOff' | 'onToggle'>;
