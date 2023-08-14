import { Moment } from 'moment';
import * as React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import { genericHitSlop } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import DayCell from '~/framework/modules/homework/components/day-cell';
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

const DayPicker = ({ onDateChange }: DayPickerProps) => {
  const isTodayWeekend = isDateWeekend(today());
  const defaultSelectedDate = isTodayWeekend
    ? addTime(today(), 1, 'week').startOf('week')
    : addTime(today(), 1, 'day').startOf('day');
  const defaultStartDate = defaultSelectedDate.clone().startOf('week');

  const [selectedDate, setSelectedDate] = React.useState(defaultSelectedDate);
  const [startDate, setStartDate] = React.useState(defaultStartDate);
  React.useEffect(() => onDateChange(defaultSelectedDate), []);

  const isPastDisabled = startDate.isSame(subtractTime(defaultStartDate, 8, 'week'));
  const isFutureDisabled = startDate.isSame(addTime(defaultStartDate, 8, 'week'));
  const dayReference = (date: Moment) =>
    date.isBefore(today(), 'day') ? DayReference.PAST : date.isSame(today(), 'day') ? DayReference.TODAY : DayReference.FUTURE;
  const isWeekdaySelected = (weekdayNumber: number) => {
    const isWithinSelectedWeek = selectedDate.isBetween(startDate, addTime(startDate, 6, 'day'), undefined, '[]');
    return isWithinSelectedWeek && isDateGivenWeekday(selectedDate, weekdayNumber);
  };
  const onSetDate = (amount: number) => {
    const date = addTime(startDate, amount, 'day');
    setSelectedDate(date);
    onDateChange(date);
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekContainer}>
        <IconButton
          icon="ui-rafterLeft"
          color={theme.palette.grey.black}
          disabled={isPastDisabled}
          action={() => setStartDate(subtractTime(startDate, 1, 'week'))}
          hitSlop={genericHitSlop}
        />
        <SmallText style={styles.week}>{displayWeekRange(startDate)}</SmallText>
        <IconButton
          icon="ui-rafterRight"
          color={theme.palette.grey.black}
          disabled={isFutureDisabled}
          action={() => setStartDate(addTime(startDate, 1, 'week'))}
          hitSlop={genericHitSlop}
        />
      </View>
      <View style={styles.daysContainer}>
        <DayCell
          dayOfTheWeek={DayOfTheWeek.MONDAY}
          dayReference={dayReference(startDate)}
          onPress={() => onSetDate(0)}
          isSelected={isWeekdaySelected(1)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.TUESDAY}
          dayReference={dayReference(addTime(startDate, 1, 'day'))}
          onPress={() => onSetDate(1)}
          isSelected={isWeekdaySelected(2)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.WEDNESDAY}
          dayReference={dayReference(addTime(startDate, 2, 'day'))}
          onPress={() => onSetDate(2)}
          isSelected={isWeekdaySelected(3)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.THURSDAY}
          dayReference={dayReference(addTime(startDate, 3, 'day'))}
          onPress={() => onSetDate(3)}
          isSelected={isWeekdaySelected(4)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.FRIDAY}
          dayReference={dayReference(addTime(startDate, 4, 'day'))}
          onPress={() => onSetDate(4)}
          isSelected={isWeekdaySelected(5)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.SATURDAY}
          dayReference={dayReference(addTime(startDate, 5, 'day'))}
          onPress={() => onSetDate(5)}
          isSelected={isWeekdaySelected(6)}
        />
      </View>
    </View>
  );
};

export default DayPicker;
