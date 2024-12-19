import { ViewStyle } from 'react-native';

import { Moment } from 'moment';

export interface DayPickerProps {
  initialSelectedDate?: Moment;
  maximumWeeks?: number;
  style?: ViewStyle;
  onDateChange: (date: Moment) => void;
}
