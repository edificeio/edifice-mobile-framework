import React from 'react';
import { TextInput as RNTextInput } from 'react-native';

import TextInput, { TextInputProps } from '~/framework/components/inputs/text';

const PasswordInput = React.forwardRef<RNTextInput, TextInputProps>((props: TextInputProps, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <TextInput
      {...props}
      toggleIconOn="ui-hide"
      toggleIconOff="ui-see"
      onToggle={() => setShowPassword(!showPassword)}
      secureTextEntry={!showPassword}
      ref={ref}
    />
  );
});

export default PasswordInput;
