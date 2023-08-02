import React from 'react';
import { Platform } from 'react-native';

import TextInput from '~/framework/components/inputs/text';
import { MultilineTextInputProps } from './types';
import { UI_SIZES } from '~/framework/components/constants';

import styles from './styles';

const MultilineTextInput = (props: MultilineTextInputProps) => {
  const heightInput = 22 * props.numberOfLines + 2 * UI_SIZES.spacing.small;
  return (
    <TextInput
      {...props}
      multiline={true}
      numberOfLines={Platform.OS === 'ios' ? undefined : props.numberOfLines}
      style={[{ height: Platform.OS === 'ios' ? heightInput : undefined }, styles.multilineInput]}
    />
  );
};

export default MultilineTextInput;
