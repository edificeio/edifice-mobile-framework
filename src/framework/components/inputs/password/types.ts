import { TextInputProps } from '../text';

export type PasswordInputProps = Omit<TextInputProps, 'toggleIconOn' | 'toggleIconOff' | 'onToggle'>;
