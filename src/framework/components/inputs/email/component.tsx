import React from 'react';

import TextInput, { TextInputProps } from '~/framework/components/inputs/text';

const EmailInput = (props: TextInputProps) => {
  return (
    <TextInput
      {...props}
      autoCorrect={false}
      autoCapitalize="none"
      keyboardType="email-address"
      placeholder={props.placeholder}
      placeholderTextColor={props.placeholderTextColor}
      value={props.value}
      onChangeText={props.onChangeText}
      returnKeyType="send"
      testID={props.testID}
      onBlur={props.onBlur}
    />
  );
};

export default EmailInput;
