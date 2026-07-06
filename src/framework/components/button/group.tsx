import React from 'react';
import { View } from 'react-native';

import styles from './styles';
import { ButtonGroupProps } from './types';

export const ButtonGroup = React.memo(function ButtonGroup({ children }: ButtonGroupProps) {
  return <View style={styles.group}>{children}</View>;
});
