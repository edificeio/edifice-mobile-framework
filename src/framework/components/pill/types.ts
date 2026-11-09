import { ColorValue } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';

export interface PillProps {
  bold?: boolean;
  color: ColorValue;
  dot?: ColorValue;
  icon?: SvgIconName;
  italic?: boolean;
  size?: 'small' | 'normal' | 'large';
  text: string;
  textColor?: ColorValue;
}
