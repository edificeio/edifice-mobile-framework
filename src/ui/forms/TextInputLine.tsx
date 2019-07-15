import * as React from "react";
import style from "glamorous-native";
import { CommonStyles } from "../../styles/common/styles";
import { TextInput, TextInputProps } from "react-native";

const TextInputContainer = style.view(
  {
    height: 40,
    paddingTop: 4,
    width: "100%"
  },
  ({ hasError, focus }) => ({
    borderBottomColor: hasError
      ? CommonStyles.errorColor
      : focus
      ? CommonStyles.iconColorOn
      : CommonStyles.entryfieldBorder,
    borderBottomWidth: focus || hasError ? 2 : 1
  })
);

const Input = style.textInput({
  color: CommonStyles.textInputColor,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 14,
  height: 40
});

export type TextInputLineProps = {
  hasError: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder: string;
  inputRef: (ref: TextInput) => void;
  secureTextEntry?: boolean;
} & TextInputProps;

export class TextInputLine extends React.Component<
  {
    hasError: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
    placeholder: string;
    inputRef: (ref: TextInput) => void;
    secureTextEntry?: boolean;
  } & TextInputProps,
  { isFocused: boolean }
> {
  state = {
    isFocused: false
  };

  onBlur() {
    this.setState({
      isFocused: false
    });
    this.props.onBlur && this.props.onBlur();
  }

  onFocus() {
    this.setState({
      isFocused: true
    });
    this.props.onFocus && this.props.onFocus();
  }

  public render() {
    const { hasError } = this.props;

    return (
      <TextInputContainer hasError={hasError} focus={this.state.isFocused}>
        <Input
          innerRef={r => this.props.inputRef(r)}
          onBlur={() => this.onBlur()}
          onFocus={() => this.onFocus()}
          placeholderTextColor={CommonStyles.placeholderColor}
          underlineColorAndroid={"transparent"}
          autoCapitalize="none"
          {...this.props}
        />
      </TextInputContainer>
    );
  }
}
