import React from 'react';
import { View } from 'react-native';

import { InputContainerProps } from './types';

import Label from '~/framework/components/inputs/container/label';

export default function InputContainer(props: InputContainerProps) {
  return (
    <View style={props.style}>
      <Label {...props.label} />
      {props.input}
    </View>
  );
}
