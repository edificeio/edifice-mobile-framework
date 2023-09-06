import React from 'react';
import { View } from 'react-native';

import Label from '~/framework/components/inputs/container/label';

import { InputContainerProps } from './types';

export default function InputContainer(props: InputContainerProps) {
  return (
    <View>
      <Label {...props.label} />
      {props.input}
    </View>
  );
}
