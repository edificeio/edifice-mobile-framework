import React, { forwardRef } from 'react';
import { TextInput as RNTextInput } from 'react-native';

import TextInput from '~/framework/components/inputs/text';
import { MultilineTextInputProps } from './types';

import styles from './styles';

const MultilineTextInput = forwardRef<RNTextInput, MultilineTextInputProps>((props: MultilineTextInputProps, ref) => {
  const { numberOfLines } = props;
  const initialHeight = styles.multilineInput.lineHeight * numberOfLines + 2 * styles.multilineInputView.paddingVertical;

  return (
    <TextInput
      {...props}
      multiline
      viewStyle={{ minHeight: initialHeight, ...styles.multilineInputView }}
      style={styles.multilineInput}
      ref={ref}
    />
  );
});

export default MultilineTextInput;
