import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import { I18n } from '~/app/i18n';
import { SmallBoldText } from '~/framework/components/text';

import styles from './styles';
import { DayCellProps } from './types';
import { UI_SIZES } from '~/framework/components/constants';
import theme from '~/app/theme';

const DayCell = ({ dayOfTheWeek, isSelected, onPress }: DayCellProps) => {
  const dayColor = {
    borderColor: theme.color.homework.days[dayOfTheWeek]?.accent,
    backgroundColor: theme.color.homework.days[dayOfTheWeek]?.background,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        isSelected && {
          borderWidth: UI_SIZES.border.small,
          ...dayColor,
        },
      ]}>
      <SmallBoldText>{I18n.get(`dayselector-${dayOfTheWeek}`)}</SmallBoldText>
    </TouchableOpacity>
  );
};

export default DayCell;
