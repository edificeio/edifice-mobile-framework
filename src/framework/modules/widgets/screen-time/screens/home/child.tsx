import * as React from 'react';
import { View } from 'react-native';

import moment from 'moment';

import { I18n } from '~/app/i18n';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import DateTimePicker from '~/framework/components/dateTimePicker';
import SegmentedControl from '~/framework/components/segmented-control';
import { BarChart } from '~/framework/modules/widgets/screen-time/components/BarChart';
import { ScreenTimeDuration } from '~/framework/modules/widgets/screen-time/components/duration';
import WeekPicker from '~/framework/modules/widgets/screen-time/components/WeekPicker';
import {
  useScreenTimeDay,
  useScreenTimeSummary,
  useScreenTimeWeek,
} from '~/framework/modules/widgets/screen-time/hooks/screen-time';

import styles from './styles';

const WEEK_SEGMENT = 0;

const DAY_SEGMENT = 1;

export interface ChildScreenTimeProps {
  childId: string;
  onInfoPress: () => void;
}

/**
 * The screen time of one child. The caller gives it a key of its own, so picking another child
 * mounts another one of these rather than emptying this one state by state.
 */
export function ChildScreenTime({ childId, onInfoPress }: Readonly<ChildScreenTimeProps>) {
  const [selectedWeek, setSelectedWeek] = React.useState<moment.Moment>(() => moment().startOf('week'));
  const [selectedDay, setSelectedDay] = React.useState<moment.Moment>(() => moment());
  const [isDayMode, setDayMode] = React.useState<boolean>(false);

  const { loading, today, yesterday } = useScreenTimeSummary(childId);
  const week = useScreenTimeWeek(childId, selectedWeek);
  const day = useScreenTimeDay(childId, selectedDay);

  const onWeekChange = React.useCallback((weekStart: moment.Moment) => {
    setSelectedWeek(weekStart);
    setSelectedDay(weekStart.clone().startOf('week'));
  }, []);

  const onDateChange = React.useCallback((date: moment.Moment) => {
    setSelectedDay(date);
    setSelectedWeek(date.clone().startOf('week'));
  }, []);

  const onModeChange = React.useCallback((index?: number) => setDayMode(index === DAY_SEGMENT), []);

  const modeSegments = React.useMemo(
    () => [
      { id: 'week', text: I18n.get('widget-screen-time-week') },
      { id: 'day', text: I18n.get('widget-screen-time-day') },
    ],
    [],
  );

  return (
    <>
      <View style={styles.summary}>
        <ScreenTimeDuration today={today} yesterday={yesterday} isLoadingValues={loading} />
      </View>
      <TertiaryButton
        iconLeft="ui-infoCircle"
        iconRight="ui-rafterRight"
        text={I18n.get('widget-screen-time-view-details')}
        action={onInfoPress}
        style={styles.info}
        testID="screen-time-info"
      />
      <View style={styles.separator} />
      <View style={styles.modeToggleContainer}>
        <SegmentedControl matchParentWidth segments={modeSegments} initialSelectedIndex={WEEK_SEGMENT} onChange={onModeChange} />
      </View>
      {isDayMode ? (
        <View style={styles.datePickerContainer}>
          <DateTimePicker mode="date" value={selectedDay} onChangeValue={onDateChange} style={styles.datePicker} />
        </View>
      ) : (
        <WeekPicker selectedWeekStart={selectedWeek} onWeekChange={onWeekChange} />
      )}
      <BarChart type={isDayMode ? 'day' : 'week'} data={(isDayMode ? day : week) ?? null} />
    </>
  );
}
