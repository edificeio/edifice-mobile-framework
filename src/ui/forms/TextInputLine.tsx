import * as React from 'react';
import { Platform, View, TextInput, StyleProp, TextInputProps, ViewStyle } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import PasswordInputText from 'react-native-hide-show-password-input';
import theme from '../../framework/util/theme';

export type TextInputLineProps = {
  hasError: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder: string;
  inputRef: (ref: TextInput) => void;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  fontSize?: number;
  isPasswordField?: boolean;
  placeholderTextColor?: string;
  textColor?: string;
} & TextInputProps;

export class TextInputLine extends React.Component<
  {
    hasError: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    placeholder: string;
    inputRef: (ref: TextInput) => void;
    style?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<ViewStyle>;
    fontSize?: number;
    isPasswordField?: boolean;
    placeholderTextColor?: string;
    textColor?: string;
  } & TextInputProps
> {
  public render() {
    const {
      hasError,
      style,
      inputStyle,
      inputRef,
      fontSize,
      isPasswordField,
      onBlur,
      onFocus,
      placeholderTextColor,
      textColor,
    } = this.props;

    const inputProps = {
      ...this.props,
      innerRef: r => inputRef(r),
      onBlur: () => onBlur && onBlur(),
      onFocus: () => onFocus && onFocus(),
      placeholderTextColor: placeholderTextColor || theme.color.text.light,
      textColor: textColor || theme.color.text.regular,
      underlineColorAndroid: 'transparent',
      autoCapitalize: 'none',
      containerStyle: style,
      inputContainerStyle: inputStyle,
      fontSize: fontSize || 16,
      lineWidth: hasError ? 2 : 1,
      activeLineWidth: 2,
      baseColor: hasError ? theme.color.failure : theme.color.inputBorder,
      tintColor: hasError ? theme.color.failure : theme.color.secondary.regular,
      iconColor: theme.color.text.light,
      label: '',
      iconSize: 25,
      invertVisibilityIcon: true,
    };
    const TextComponent = isPasswordField ? PasswordInputText : TextField;
    return (
      <View style={{ alignSelf: 'stretch' }}>
        <TextComponent {...inputProps} />
      </View>
    );
  }
}
