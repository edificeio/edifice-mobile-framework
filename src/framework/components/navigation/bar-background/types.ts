import type { ColorValue } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';

export interface BarBackgroundProps {
  backgroundColor: ColorValue;
  barType: 'navBar' | 'tabBar';
  lineImage?: SvgIconName;
}
