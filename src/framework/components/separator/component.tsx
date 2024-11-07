import * as React from 'react';
import { View, ViewStyle } from 'react-native';

import styles from './styles';
import { SeparatorProps } from './types';

export default function Separator(props: SeparatorProps) {
  const suppStyles: ViewStyle = {
    marginHorizontal: props.marginHorizontal ?? 0,
    marginVertical: props.marginVertical ?? 0,
  };

  return <View style={[styles.container, suppStyles]} />;
}
