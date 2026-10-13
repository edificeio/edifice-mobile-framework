import type { StyleProp, ViewStyle } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';

export interface ScreenTimeMessageProps {
  illustration?: SvgIconName;
  style?: StyleProp<ViewStyle>;
  text: string;
}
