import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import { I18n } from '~/app/i18n';
import { SmallBoldText } from '~/framework/components/text';

import styles from './styles';
import theme from '~/app/theme';
import { DayReference } from '~/framework/util/date';
import { DayCellProps } from './types';

const DayCell = ({ dayOfTheWeek, dayReference, isSelected, onPress }: DayCellProps) => {
  const containerStyle = isSelected
    ? {
        borderColor: theme.color.homework.days[dayOfTheWeek]?.accent,
        backgroundColor: theme.color.homework.days[dayOfTheWeek]?.background,
      }
    : dayReference === DayReference.TODAY
    ? { borderColor: theme.palette.grey.graphite }
    : undefined;
  const textStyle = dayReference === DayReference.PAST && { color: theme.palette.grey.graphite };
  const text = I18n.get(`date-${dayOfTheWeek}`);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, containerStyle]}>
      <SmallBoldText style={[styles.text, textStyle]}>{text}</SmallBoldText>
    </TouchableOpacity>
  );
};

export default DayCell;
