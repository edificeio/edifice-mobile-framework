import React, { forwardRef } from 'react';
import { PixelRatio, TextInput as RNTextInput } from 'react-native';

import stylesTextInput from '../text/styles';
import styles from './styles';
import { MultilineTextInputProps } from './types';

import TextInput from '~/framework/components/inputs/text';

const IOS_TEXTINPUT_LINE_HEIGHT = 1.23; // This is a magic value because IOS overrides line-height in TextInputs with a unknown value. This is an estimation of that value.

const MultilineTextInput = forwardRef<RNTextInput, MultilineTextInputProps>((props: MultilineTextInputProps, ref) => {
  const { numberOfLines } = props;
  const initialHeight =
    stylesTextInput.input.paddingTop +
    stylesTextInput.input.paddingBottom +
    stylesTextInput.input.fontSize * IOS_TEXTINPUT_LINE_HEIGHT * numberOfLines * PixelRatio.getFontScale();

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
