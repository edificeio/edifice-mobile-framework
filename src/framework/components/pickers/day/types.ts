import { Moment } from 'moment';
import { ViewStyle } from 'react-native';

export interface DayPickerProps {
  initialSelectedDate?: Moment;
  maximumWeeks?: number;
  style?: ViewStyle;
  onDateChange: (date: Moment) => void;
}
