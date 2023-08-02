import * as React from 'react';
import { View } from 'react-native';

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
import DayCell from '~/framework/modules/homework/components/day-cell';
import { DayPickerProps } from './types';

import { SmallText } from '../text';
import styles from './styles';

import PictureButton from '../buttons/picture/component';
import theme from '~/app/theme';
import { Moment } from 'moment';
import { genericHitSlop } from '../constants';

const DayPicker = (props: DayPickerProps) => {
  const isTodayWeekend = isDateWeekend(today());
  const defaultSelectedDate = isTodayWeekend
    ? addTime(today(), 1, 'week').startOf('week')
    : addTime(today(), 1, 'day').startOf('day');
  const defaultStartDate = defaultSelectedDate.clone().startOf('week');

  const [selectedDate, setSelectedDate] = React.useState(defaultSelectedDate);
  const [startDate, setStartDate] = React.useState(defaultStartDate);

  const isPastDisabled = startDate.isSame(subtractTime(defaultStartDate, 8, 'week'));
  const isFutureDisabled = startDate.isSame(addTime(defaultStartDate, 8, 'week'));
  const dayReference = (date: Moment) =>
    date.isBefore(today(), 'day') ? DayReference.PAST : date.isSame(today(), 'day') ? DayReference.TODAY : DayReference.FUTURE;
  const isWeekdaySelected = (weekdayNumber: number) => {
    const isWithinSelectedWeek = selectedDate.isBetween(startDate, addTime(startDate, 6, 'day'), undefined, '[]');
    return isWithinSelectedWeek && isDateGivenWeekday(selectedDate, weekdayNumber);
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekContainer}>
        <PictureButton
          iconName="ui-rafterLeft"
          pictureFill={theme.palette.grey.black}
          disabled={isPastDisabled}
          action={() => setStartDate(subtractTime(startDate, 1, 'week'))}
          hitSlop={genericHitSlop}
        />
        <SmallText style={styles.week}>{displayWeekRange(startDate)}</SmallText>
        <PictureButton
          iconName="ui-rafterRight"
          pictureFill={theme.palette.grey.black}
          disabled={isFutureDisabled}
          action={() => setStartDate(addTime(startDate, 1, 'week'))}
          hitSlop={genericHitSlop}
        />
      </View>
      <View style={styles.daysContainer}>
        <DayCell
          dayOfTheWeek={DayOfTheWeek.MONDAY}
          dayReference={dayReference(startDate)}
          onPress={() => setSelectedDate(startDate)}
          isSelected={isWeekdaySelected(1)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.TUESDAY}
          dayReference={dayReference(addTime(startDate, 1, 'day'))}
          onPress={() => setSelectedDate(addTime(startDate, 1, 'day'))}
          isSelected={isWeekdaySelected(2)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.WEDNESDAY}
          dayReference={dayReference(addTime(startDate, 2, 'day'))}
          onPress={() => setSelectedDate(addTime(startDate, 2, 'day'))}
          isSelected={isWeekdaySelected(3)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.THURSDAY}
          dayReference={dayReference(addTime(startDate, 3, 'day'))}
          onPress={() => setSelectedDate(addTime(startDate, 3, 'day'))}
          isSelected={isWeekdaySelected(4)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.FRIDAY}
          dayReference={dayReference(addTime(startDate, 4, 'day'))}
          onPress={() => setSelectedDate(addTime(startDate, 4, 'day'))}
          isSelected={isWeekdaySelected(5)}
        />
        <DayCell
          dayOfTheWeek={DayOfTheWeek.SATURDAY}
          dayReference={dayReference(addTime(startDate, 5, 'day'))}
          onPress={() => setSelectedDate(addTime(startDate, 5, 'day'))}
          isSelected={isWeekdaySelected(6)}
        />
      </View>
    </View>
  );
};

export default DayPicker;
