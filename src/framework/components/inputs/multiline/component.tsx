import React, { forwardRef } from 'react';
import { PixelRatio, Platform, TextInput as RNTextInput } from 'react-native';

import styles from './styles';
import { MultilineTextInputProps } from './types';

import TextInput from '~/framework/components/inputs/text';
import stylesTextInput, { TEXTINPUT_LINE_HEIGHT } from '~/framework/components/inputs/text/styles';

const MultilineTextInput = forwardRef<RNTextInput, MultilineTextInputProps>((props: MultilineTextInputProps, ref) => {
  const { numberOfLines } = props;
  // Properly compute the height of N lines of text depending on the OS.
  const initialHeight = Platform.select({
    android: stylesTextInput.input.fontSize * TEXTINPUT_LINE_HEIGHT * PixelRatio.getFontScale() * numberOfLines,
    default:
      stylesTextInput.input.paddingTop +
      stylesTextInput.input.paddingBottom +
      stylesTextInput.input.fontSize * TEXTINPUT_LINE_HEIGHT * PixelRatio.getFontScale() * numberOfLines,
  });

  return (
    <TextInput
      {...props}
      scrollEnabled={false}
      multiline
      style={[styles.multilineInput, { minHeight: initialHeight }, props.style]}
      ref={ref}
    />
  );
});

export default MultilineTextInput;
