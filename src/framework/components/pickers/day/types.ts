import { Moment } from 'moment';

export interface DayPickerProps {
  onDateChange: (date: Moment) => void;
}
