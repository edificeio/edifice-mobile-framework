import type { ColorValue } from 'react-native';

import type { SharedValue } from 'react-native-reanimated';

import type { SvgIconName } from '~/framework/components/picture';

export interface SwipeActionProps {
  color: ColorValue;
  filled?: boolean;
  icon: SvgIconName;
  label: string;
  onPress: () => void;
  // goes from 0 to 1 as the row uncovers the action.
  progress: SharedValue<number>;
  testID?: string;
}
