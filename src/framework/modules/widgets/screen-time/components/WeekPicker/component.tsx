import * as React from 'react';
import { View } from 'react-native';

import { Moment } from 'moment';

import styles from './styles';
import { WeekPickerProps } from './types';

import IconButton from '~/framework/components/buttons/icon';
import { SmallText } from '~/framework/components/text';
import { addTime, subtractTime } from '~/framework/util/date';

const WeekPicker = ({ disabled = false, onWeekChange, selectedWeekStart, style }: WeekPickerProps) => {
  const [currentWeekStart, setCurrentWeekStart] = React.useState<Moment>(selectedWeekStart.clone().startOf('week'));

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
    if (disabled) return;
    const newWeekStart = addTime(currentWeekStart, 1, 'week');
    setCurrentWeekStart(newWeekStart);
    onWeekChange(newWeekStart);
  };

  const formatWeekDisplay = (weekStart: Moment) => {
    const weekEnd = weekStart.clone().endOf('week');
    return `${weekStart.format('DD/MM')} - ${weekEnd.format('DD/MM/YYYY')}`;
  };

  return (
    <View style={[styles.container, disabled && styles.disabledContainer, style]}>
      <IconButton icon="ui-rafterLeft" disabled={disabled} action={handlePreviousWeek} />

      <View style={styles.weekTextContainer}>
        <SmallText style={styles.weekText}>{formatWeekDisplay(currentWeekStart)}</SmallText>
      </View>

      <IconButton icon="ui-rafterRight" disabled={disabled} action={handleNextWeek} />
    </View>
  );
};

export default WeekPicker;
