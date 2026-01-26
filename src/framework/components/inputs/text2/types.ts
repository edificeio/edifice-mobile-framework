import type { TextInputProps as RNTextInputProps, ViewStyle } from 'react-native';
import { StyleProp, TextStyle, ViewProps } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export interface BaseTextInputStyle
  extends Omit<ViewStyle, 'padding' | 'paddingBottom' | 'paddingTop' | 'paddingVertical' | 'height'>,
    Omit<TextStyle, keyof ViewStyle> {}

export interface BaseTextInputProps extends Omit<RNTextInputProps, 'style' | 'multiline'> {
  inputStyle?: StyleProp<BaseTextInputStyle>;
  wrapperStyle: ViewProps['style'];
  aimHeight: number;
}

export interface BaseTextAreaProps extends Omit<RNTextInputProps, 'style' | 'multiline'> {
  inputStyle: RNTextInputProps['style'];
  wrapperStyle: ViewProps['style'];
  maxLines?: number;
  minLines?: number;
  aimHeight: number;
}

export interface ChatTextAreaProps extends Omit<BaseTextAreaProps, 'aimHeight' | 'inputStyle' | 'wrapperStyle'> {
  size?: keyof typeof UI_SIZES.elements.avatar;
  inputStyle?: BaseTextAreaProps['inputStyle'];
  wrapperStyle?: BaseTextAreaProps['wrapperStyle'];
}
