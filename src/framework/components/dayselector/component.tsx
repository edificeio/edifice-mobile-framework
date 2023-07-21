import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import { today } from '~/framework/util/date';
import DayCell from '~/framework/modules/homework/components/day-cell';
import { DaySelectorProps } from './types';

import { SmallText } from '../text';
import styles from './styles';

import PictureButton from '../buttons/picture/component';
import { uppercaseFirstLetter } from '~/framework/util/string';

const DaySelector = (props: DaySelectorProps) => {
  const isTodayWeekend = today().day() === 0 || today().day() === 6;
  const defaultSelectedDate = isTodayWeekend ? today().clone().add(1, 'weeks').day(1) : today().clone().add(1, 'day');
  const defaultStartOfWeek = defaultSelectedDate.clone().startOf('week');

  const [selectedDate, setSelectedDate] = React.useState(defaultSelectedDate);
  const [startDate, setStartDate] = React.useState(defaultStartOfWeek);

  const isPastDisabled = startDate.isSame(defaultStartOfWeek.clone().subtract(8, 'week'));
  const isFutureDisabled = startDate.isSame(defaultStartOfWeek.clone().add(8, 'week'));
  const isCurrentWeek = startDate.isSame(defaultStartOfWeek);
  const isNextWeek = startDate.isSame(defaultStartOfWeek.clone().add(1, 'week'));
  const endDate = startDate.clone().add(6, 'days');
  const isSelectedDateWithinSelectedWeek = selectedDate.isBetween(startDate, endDate, undefined, '[]');
  const selectedWeekDay = selectedDate.day();

  return (
    <View style={styles.container}>
      <View style={styles.weekSelectorContainer}>
        <PictureButton
          iconName="ui-rafterLeft"
          disabled={isPastDisabled}
          action={() => setStartDate(startDate.clone().subtract(1, 'weeks'))}
        />
        <View style={styles.weekContainer}>
          <SmallText>
            {isCurrentWeek
              ? I18n.get('dayselector-week-current')
              : isNextWeek
              ? I18n.get('dayselector-week-next')
              : I18n.get('dayselector-week-of', {
                  startDate: startDate.format('D'),
                  endDate: endDate.format('D'),
                })}
          </SmallText>
          {isCurrentWeek ? null : (
            <SmallText>
              {isNextWeek
                ? I18n.get('dayselector-week-range', { startDate: startDate.format('D MMM'), endDate: endDate.format('D MMM') })
                : uppercaseFirstLetter(endDate.format('MMMM Y'))}
            </SmallText>
          )}
        </View>
        <PictureButton
          iconName="ui-rafterRight"
          disabled={isFutureDisabled}
          action={() => setStartDate(startDate.clone().add(1, 'weeks'))}
        />
      </View>
      <View style={styles.daysContainer}>
        <DayCell
          dayOfTheWeek="monday"
          onPress={() => setSelectedDate(startDate)}
          isSelected={isSelectedDateWithinSelectedWeek && selectedWeekDay === 1}
        />
        <DayCell
          dayOfTheWeek="tuesday"
          onPress={() => setSelectedDate(startDate.clone().add(1, 'day'))}
          isSelected={isSelectedDateWithinSelectedWeek && selectedWeekDay === 2}
        />
        <DayCell
          dayOfTheWeek="wednesday"
          onPress={() => setSelectedDate(startDate.clone().add(2, 'day'))}
          isSelected={isSelectedDateWithinSelectedWeek && selectedWeekDay === 3}
        />
        <DayCell
          dayOfTheWeek="thursday"
          onPress={() => setSelectedDate(startDate.clone().add(3, 'day'))}
          isSelected={isSelectedDateWithinSelectedWeek && selectedWeekDay === 4}
        />
        <DayCell
          dayOfTheWeek="friday"
          onPress={() => setSelectedDate(startDate.clone().add(4, 'day'))}
          isSelected={isSelectedDateWithinSelectedWeek && selectedWeekDay === 5}
        />
        <DayCell
          dayOfTheWeek="saturday"
          onPress={() => setSelectedDate(startDate.clone().add(5, 'day'))}
          isSelected={isSelectedDateWithinSelectedWeek && selectedWeekDay === 6}
        />
      </View>
    </View>
  );
};

export default DaySelector;
