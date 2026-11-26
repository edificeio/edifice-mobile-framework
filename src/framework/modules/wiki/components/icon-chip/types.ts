import { ColorValue } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';

export interface IconChipProps {
  icon: SvgIconName;
  iconColor: ColorValue;
  iconContainerColor: ColorValue;
  testId?: string;
}
