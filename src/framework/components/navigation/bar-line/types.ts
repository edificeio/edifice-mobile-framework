import type { ColorValue } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';

export interface BarLineProps {
  bar: 'navBar' | 'tabBar';
  background: ColorValue;
  line?: SvgIconName;
}
