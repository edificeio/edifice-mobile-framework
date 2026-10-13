import * as React from 'react';
import { View } from 'react-native';

import { Moment } from 'moment';

import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { BodyText } from '~/framework/components/text';
import { addTime, displayWeekRange, subtractTime, today } from '~/framework/util/date';

import styles from './styles';
import { WeekPickerProps } from './types';

const DISABLED_ICON_COLOR = theme.palette.grey.stone;

const WeekPicker = ({
  disabled = false,
  iconColor = theme.palette.primary.regular,
  onWeekChange,
  selectedWeekStart,
  style,
}: WeekPickerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = React.useState<Moment>(selectedWeekStart.clone().startOf('week'));

  const displayLabel = displayWeekRange(currentWeekStart);

  const canGoNext = currentWeekStart.isBefore(today(), 'week');

  React.useEffect(() => {
    setCurrentWeekStart(selectedWeekStart.clone().startOf('week'));
  }, [selectedWeekStart]);

  const handlePreviousWeek = () => {
    if (disabled) return;
    const newWeekStart = subtractTime(currentWeekStart, 1, 'week');
    setCurrentWeekStart(newWeekStart);
    onWeekChange(newWeekStart);
  };

  const handleNextWeek = () => {
    if (disabled || !canGoNext) return;
    const newWeekStart = addTime(currentWeekStart, 1, 'week');
    setCurrentWeekStart(newWeekStart);
    onWeekChange(newWeekStart);
  };

  return (
    <View style={[styles.container, disabled && styles.disabledContainer, style]}>
      <IconButton icon="ui-rafterLeft" color={iconColor} disabled={disabled} action={handlePreviousWeek} />

      <View style={styles.weekTextContainer}>
        <BodyText style={styles.weekText}>{displayLabel}</BodyText>
      </View>

      <IconButton
        icon="ui-rafterRight"
        color={canGoNext ? iconColor : DISABLED_ICON_COLOR}
        disabled={disabled || !canGoNext}
        action={handleNextWeek}
      />
    </View>
  );
};

export default WeekPicker;
