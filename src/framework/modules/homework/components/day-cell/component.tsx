import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import { I18n } from '~/app/i18n';
import { SmallBoldText } from '~/framework/components/text';

import styles from './styles';
import { DayCellProps } from './types';

const DayCell = ({ day, isSelected, onPress }: DayCellProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, isSelected && styles.selected]}>
      <SmallBoldText>{I18n.get(`dayselector-${day}`)}</SmallBoldText>
    </TouchableOpacity>
  );
};

export default DayCell;
