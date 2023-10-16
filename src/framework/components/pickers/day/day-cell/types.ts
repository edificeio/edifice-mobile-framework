import { DayOfTheWeek, DayReference } from '~/framework/util/date';

export interface DayCellProps {
  dayOfTheWeek: DayOfTheWeek;
  dayReference: DayReference;
  isSelected: boolean;
  onPress: () => void;
}
