import * as React from 'react';
import { View } from 'react-native';

import styles from '~/framework/modules/user/components/bottom-round-decoration/styles';
import { BottomRoundDecorationProps } from '~/framework/modules/user/components/bottom-round-decoration/types';

export const BottomRoundDecoration = ({ child, style }: BottomRoundDecorationProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.subContainer}>{child}</View>
    </View>
  );
};
