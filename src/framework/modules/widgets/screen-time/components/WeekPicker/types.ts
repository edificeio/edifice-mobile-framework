import { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { Moment } from 'moment';

export interface WeekPickerProps {
  /** First day of the selected week */
  selectedWeekStart: Moment;
  /** Called whenever another week is picked */
  onWeekChange: (weekStart: Moment) => void;
  /** Whether the picker can be used */
  disabled?: boolean;
  /** Style of the container, the placement of the picker being the caller's business */
  style?: StyleProp<ViewStyle>;
  /** Colour of the chevrons, indigo unless told otherwise */
  iconColor?: ColorValue;
}
