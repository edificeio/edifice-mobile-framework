import { Moment } from 'moment';
import { ViewStyle } from 'react-native';

export interface DayPickerProps {
  initialSelectedDate?: Moment;
  style?: ViewStyle;
  onDateChange: (date: Moment) => void;
}
