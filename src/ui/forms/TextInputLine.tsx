import * as React from "react";
import { View, TextInput, StyleProp, TextInputProps, ViewStyle } from "react-native";
import { TextField } from "react-native-material-textfield";
import PasswordInputText from "react-native-hide-show-password-input";
import { CommonStyles } from "../../styles/common/styles";

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
      textColor
    } = this.props;

    const inputProps = {
      ...this.props,
      innerRef: r => inputRef(r),
      onBlur: () => onBlur && onBlur(),
      onFocus: () => onFocus && onFocus(),
      placeholderTextColor: placeholderTextColor || CommonStyles.placeholderColor,
      textColor: textColor || CommonStyles.textInputColor,
      underlineColorAndroid: "transparent",
      autoCapitalize: "none",
      containerStyle: style,
      inputContainerStyle: inputStyle,
      fontSize: fontSize || 16,
      lineWidth: hasError ? 2 : 1,
      activeLineWidth: 2,
      baseColor: hasError ? CommonStyles.errorColor : CommonStyles.entryfieldBorder,
      tintColor: hasError ? CommonStyles.errorColor : CommonStyles.iconColorOn,
      label: ""
    }
    
    return (
      <View style={{ alignSelf: "stretch", }}>
        {isPasswordField ? <PasswordInputText {...inputProps} /> : <TextField {...inputProps} />}
      </View>
    );
  }
}
