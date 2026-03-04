import React from 'react';
import { Pressable } from 'react-native';

import { styles } from './styles';
import { MyAppsFilterCellProps } from './types';

import { SmallBoldText } from '~/framework/components/text';

export const MyAppsFilterCell = ({ label, onPress, selected }: MyAppsFilterCellProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, selected ? styles.selected : styles.unselected, pressed && styles.pressed]}>
      <SmallBoldText numberOfLines={1} style={[styles.text, selected ? styles.textSelected : styles.textUnselected]}>
        {label}
      </SmallBoldText>
    </Pressable>
  );
};
export default MyAppsFilterCell;
