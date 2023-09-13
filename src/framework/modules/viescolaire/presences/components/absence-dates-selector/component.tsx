import moment, { Moment } from 'moment';
import React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import DefaultButton from '~/framework/components/buttons/default';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_STYLES } from '~/framework/components/constants';
import DateTimePicker from '~/framework/components/dateTimePicker';
import Label from '~/framework/components/inputs/container/label';
import { SmallText } from '~/framework/components/text';

import styles from './styles';
import type { AbsenceDatesSelectorProps } from './types';

export default function AbsenceDatesSelector(props: AbsenceDatesSelectorProps) {
  const [isSingleDay, setSingleDay] = React.useState(true);
  const { endDate, startDate } = props;

  const changeMode = () => setSingleDay(!isSingleDay);

  React.useEffect(() => {
    if (isSingleDay && !endDate.isSame(startDate, 'day')) {
      props.onChangeEndDate(endDate.set({ dayOfYear: startDate.dayOfYear(), year: startDate.year() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSingleDay]);

  const setStartDate = (date: Moment) => {
    props.onChangeStartDate(startDate.clone().set({ dayOfYear: date.dayOfYear(), year: date.year() }));
    if (isSingleDay) {
      props.onChangeEndDate(endDate.clone().set({ dayOfYear: date.dayOfYear(), year: date.year() }));
    }
  };

  const setEndDate = (date: Moment) =>
    props.onChangeEndDate(endDate.clone().set({ dayOfYear: date.dayOfYear(), year: date.year() }));

  const setStartTime = (date: Moment) =>
    props.onChangeStartDate(startDate.clone().set({ hour: date.hour(), minute: date.minute() }));

  const setEndTime = (date: Moment) => props.onChangeEndDate(endDate.clone().set({ hour: date.hour(), minute: date.minute() }));

  return (
    <View>
      <Label text={I18n.get('presences-declareabsence-dates-label')} icon="ui-calendarLight" />
      <View style={styles.container}>
        <View style={styles.dateContainer}>
          <SmallText>
            {I18n.get(isSingleDay ? 'presences-declareabsence-dates-on' : 'presences-declareabsence-dates-from')}
          </SmallText>
          <DateTimePicker
            mode="date"
            value={startDate}
            onChangeValue={setStartDate}
            minimumDate={moment().startOf('day')}
            maximumDate={isSingleDay ? undefined : endDate}
          />
        </View>
        <View style={styles.separatorContainer} />
        <View style={styles.dateContainer}>
          {isSingleDay ? (
            <TertiaryButton text={I18n.get('presences-declareabsence-dates-addend')} iconLeft="ui-plus" action={changeMode} />
          ) : (
            <View style={styles.endDateContainer}>
              <View style={UI_STYLES.flexShrink1}>
                <SmallText>{I18n.get('presences-declareabsence-dates-to')}</SmallText>
                <DateTimePicker mode="date" value={endDate} onChangeValue={setEndDate} minimumDate={startDate} />
              </View>
              <DefaultButton round iconLeft="ui-close" style={styles.removeEndDateAction} action={changeMode} />
            </View>
          )}
        </View>
      </View>
      <View style={styles.timeContainer}>
        <SmallText style={styles.timeText}>{I18n.get('presences-declareabsence-time-from')}</SmallText>
        <DateTimePicker mode="time" value={startDate} onChangeValue={setStartTime} />
        <SmallText style={styles.timeText}>{I18n.get('presences-declareabsence-time-to')}</SmallText>
        <DateTimePicker mode="time" value={endDate} onChangeValue={setEndTime} />
      </View>
    </View>
  );
}
