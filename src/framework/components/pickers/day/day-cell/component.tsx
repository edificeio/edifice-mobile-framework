import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallBoldText } from '~/framework/components/text';
import { DayReference } from '~/framework/util/date';

import { styles } from './styles';
import { DayCellProps } from './types';

const DayCell = ({ dayOfTheWeek, dayReference, isSelected, onPress }: DayCellProps) => {
  const isPastDay = dayReference === DayReference.PAST;
  const isToday = dayReference === DayReference.TODAY;
  const containerStyle = isSelected ? { backgroundColor: theme.color.homework.days[dayOfTheWeek]?.background } : undefined;
  const absoluteContainerStyle = isSelected
    ? {
        borderColor: theme.color.homework.days[dayOfTheWeek]?.[isPastDay ? 'light' : 'accent'],
        borderWidth: UI_SIZES.border.small,
      }
    : isToday
    ? { borderColor: theme.palette.grey.graphite }
    : undefined;
  const textStyle = isPastDay && { color: theme.palette.grey.graphite };
  const text = I18n.get(`date-${dayOfTheWeek}`);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, containerStyle]}>
      <View style={[styles.absoluteContainer, absoluteContainerStyle]} />
      <SmallBoldText style={[styles.text, textStyle]}>{text}</SmallBoldText>
    </TouchableOpacity>
  );
};

export default DayCell;
