import React from 'react';
import { TextInput as RNTextInput } from 'react-native';

import { PasswordInputProps } from './types';

import TextInput from '~/framework/components/inputs/text';

const PasswordInput = React.forwardRef<RNTextInput, PasswordInputProps>((props, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <TextInput
      {...props}
      toggleIconOn="ui-hide"
      toggleIconOff="ui-see"
      onToggle={() => setShowPassword(!showPassword)}
      secureTextEntry={!showPassword}
      ref={ref}
      autoCapitalize="none"
      autoComplete="off"
    />
  );
});

export default PasswordInput;
