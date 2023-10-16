import type { Moment } from 'moment';

export interface AbsenceDatesSelectorProps {
  endDate: Moment;
  startDate: Moment;
  onChangeEndDate: (value: Moment) => void;
  onChangeStartDate: (value: Moment) => void;
}
