import React, { forwardRef } from 'react';
import { TextInput as RNTextInput } from 'react-native';

import TextInput, { styles as stylesTextInput } from '~/framework/components/inputs/text';
import { TextSizeStyle } from '~/framework/components/text';

import styles from './styles';
import { MultilineTextInputProps } from './types';

const MultilineTextInput = forwardRef<RNTextInput, MultilineTextInputProps>((props: MultilineTextInputProps, ref) => {
  const { numberOfLines } = props;
  const initialHeight = TextSizeStyle.Medium.lineHeight! * numberOfLines + 2 * stylesTextInput.input.paddingTop;

  return (
    <TextInput {...props} scrollEnabled={false} multiline style={[styles.multilineInput, { minHeight: initialHeight }]} ref={ref} />
  );
});

export default MultilineTextInput;
