import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { SmallBoldText } from '~/framework/components/text';
import { DayReference } from '~/framework/util/date';

import styles from './styles';
import { DayCellProps } from './types';

const DayCell = ({ dayOfTheWeek, dayReference, isSelected, onPress }: DayCellProps) => {
  const isPastDay = dayReference === DayReference.PAST;
  const isToday = dayReference === DayReference.TODAY;
  const containerStyle = isSelected
    ? {
        borderColor: theme.color.homework.days[dayOfTheWeek]?.[isPastDay ? 'light' : 'accent'],
        backgroundColor: theme.color.homework.days[dayOfTheWeek]?.background,
      }
    : isToday
    ? { borderColor: theme.palette.grey.graphite }
    : undefined;
  const textStyle = isPastDay && { color: theme.palette.grey.graphite };
  const text = I18n.get(`date-${dayOfTheWeek}`);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, containerStyle]}>
      <SmallBoldText style={[styles.text, textStyle]}>{text}</SmallBoldText>
    </TouchableOpacity>
  );
};

export default DayCell;
