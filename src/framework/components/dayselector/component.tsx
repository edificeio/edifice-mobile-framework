import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import { getDayOfTheWeek, today } from '~/framework/util/date';
import DayCell from '~/framework/modules/homework/components/day-cell';
import { DaySelectorProps } from './types';

import { SmallText } from '../text';
import styles from './styles';

import PictureButton from '../buttons/picture/component';

const DaySelector = (props: DaySelectorProps) => {
  const [selectedDate, setSelectedDate] = React.useState('');
  const [startDate, setStartDate] = React.useState(getDayOfTheWeek(today()));

  return (
    <View style={styles.container}>
      <View style={styles.weekSelectorContainer}>
        <PictureButton iconName="ui-rafterLeft" action={() => setStartDate('')} />
        <View style={styles.weekContainer}>
          <SmallText>{I18n.get('dayselector-week-of', { startDate: '25', endDate: '30' })}</SmallText>
          <SmallText>{'Octobre 2023'}</SmallText>
        </View>
        <PictureButton iconName="ui-rafterRight" action={() => setStartDate('')} />
      </View>
      <View style={styles.daysContainer}>
        <DayCell day="monday" onPress={() => setSelectedDate('L')} isSelected={selectedDate === 'L'} />
        <DayCell day="tuesday" onPress={() => setSelectedDate('Ma')} isSelected={selectedDate === 'Ma'} />
        <DayCell day="wednesday" onPress={() => setSelectedDate('Me')} isSelected={selectedDate === 'Me'} />
        <DayCell day="thursday" onPress={() => setSelectedDate('J')} isSelected={selectedDate === 'J'} />
        <DayCell day="friday" onPress={() => setSelectedDate('V')} isSelected={selectedDate === 'V'} />
        <DayCell day="saturday" onPress={() => setSelectedDate('S')} isSelected={selectedDate === 'S'} />
      </View>
    </View>
  );
};

export default DaySelector;
