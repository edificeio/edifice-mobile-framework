import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallBoldText } from '~/framework/components/text';
import { I18n } from '~/util/i18n';

import styles from './styles';
import { DayCellProps } from './types';

const DayCell = ({ dayOfTheWeek, isSelected, onPress }: DayCellProps) => {
  const dayColor = {
    backgroundColor: theme.color.homework.days[dayOfTheWeek]?.background,
    borderColor: theme.color.homework.days[dayOfTheWeek]?.accent,
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
      <SmallBoldText>{I18n.get(`date-${dayOfTheWeek}`)}</SmallBoldText>
    </TouchableOpacity>
  );
};

export default DayCell;
