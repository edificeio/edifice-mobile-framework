import { Moment } from 'moment';
import * as React from 'react';
import { AppState, AppStateStatus, View } from 'react-native';

import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { deviceFontScale, genericHitSlop } from '~/framework/components/constants';
import DayCell from '~/framework/components/pickers/day/day-cell';
import { SmallText, TextSizeStyle } from '~/framework/components/text';
import {
  DayOfTheWeek,
  DayReference,
  addTime,
  displayWeekRange,
  isDateGivenWeekday,
  isDateWeekend,
  subtractTime,
  today,
} from '~/framework/util/date';

import styles from './styles';
import { DayPickerProps } from './types';

export const defaultSelectedDate = isDateWeekend(today())
  ? addTime(today(), 1, 'week').startOf('week')
  : addTime(today(), 1, 'day').startOf('day');

const DayPicker = ({ initialSelectedDate = defaultSelectedDate, style, onDateChange }: DayPickerProps) => {
  const defaultStartDate = initialSelectedDate.clone().startOf('week');

  const [selectedDate, setSelectedDate] = React.useState(initialSelectedDate);
  const [startDate, setStartDate] = React.useState(defaultStartDate);
  React.useEffect(() => onDateChange(initialSelectedDate), []);

  const isPastDisabled = startDate.isSame(subtractTime(defaultStartDate, 8, 'week'));
  const isFutureDisabled = startDate.isSame(addTime(defaultStartDate, 8, 'week'));
  const dayReference = (date: Moment) =>
    date.isBefore(today(), 'day') ? DayReference.PAST : date.isSame(today(), 'day') ? DayReference.TODAY : DayReference.FUTURE;
  const isWeekdaySelected = (weekdayNumber: number) => {
    const isWithinSelectedWeek = selectedDate.isBetween(startDate, addTime(startDate, 6, 'day'), undefined, '[]');
    return isWithinSelectedWeek && isDateGivenWeekday(selectedDate, weekdayNumber);
  };
  const onSetDate = (baseDate: Moment, amount: number) => {
    const date = addTime(baseDate, amount, 'day');
    setSelectedDate(date);
    onDateChange(date);
  };
  const onSetPreviousWeek = () => {
    const previousWeek = subtractTime(startDate, 1, 'week');
    setStartDate(previousWeek);
    onSetDate(previousWeek, 5);
  };
  const onSetNextWeek = () => {
    const nextWeek = addTime(startDate, 1, 'week');
    setStartDate(nextWeek);
    onSetDate(nextWeek, 0);
  };

  const [currentFontScale, setCurrentFontScale] = React.useState(deviceFontScale());
  const currentState = React.useRef<AppStateStatus>();
  const handleAppStateChange = React.useCallback(
    (nextAppState: AppStateStatus) => {
      currentState.current = nextAppState;
      const newFontScale = deviceFontScale();
      if (nextAppState === 'active' && newFontScale !== currentFontScale) {
        setCurrentFontScale(newFontScale);
      }
    },
    [currentFontScale],
  );
  React.useEffect(() => {
    const appStateListener = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      appStateListener.remove();
    };
  }, [handleAppStateChange]);
  const weekContainerStyle = { height: TextSizeStyle.Normal.lineHeight * currentFontScale * 2 };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.weekContainer, weekContainerStyle]}>
        <IconButton
          icon="ui-rafterLeft"
          color={isPastDisabled ? theme.palette.grey.grey : theme.palette.grey.black}
          disabled={isPastDisabled}
          action={onSetPreviousWeek}
          hitSlop={genericHitSlop}
        />
        <SmallText style={styles.week}>{displayWeekRange(startDate)}</SmallText>
        <IconButton
          icon="ui-rafterRight"
          color={isFutureDisabled ? theme.palette.grey.grey : theme.palette.grey.black}
          disabled={isFutureDisabled}
          action={onSetNextWeek}
          hitSlop={genericHitSlop}
        />
      </View>
      <View style={styles.daysContainer}>
        <DayCell
          dayOfTheWeek={DayOfTheWeek.MONDAY}
          dayReference={dayReference(startDate)}
          onPress={() => onSetDate(startDate, 0)}
          isSelected={isWeekdaySelected(1)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.TUESDAY}
          dayReference={dayReference(addTime(startDate, 1, 'day'))}
          onPress={() => onSetDate(startDate, 1)}
          isSelected={isWeekdaySelected(2)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.WEDNESDAY}
          dayReference={dayReference(addTime(startDate, 2, 'day'))}
          onPress={() => onSetDate(startDate, 2)}
          isSelected={isWeekdaySelected(3)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.THURSDAY}
          dayReference={dayReference(addTime(startDate, 3, 'day'))}
          onPress={() => onSetDate(startDate, 3)}
          isSelected={isWeekdaySelected(4)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.FRIDAY}
          dayReference={dayReference(addTime(startDate, 4, 'day'))}
          onPress={() => onSetDate(startDate, 4)}
          isSelected={isWeekdaySelected(5)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.SATURDAY}
          dayReference={dayReference(addTime(startDate, 5, 'day'))}
          onPress={() => onSetDate(startDate, 5)}
          isSelected={isWeekdaySelected(6)}
        />
      </View>
    </View>
  );
};

export default DayPicker;
