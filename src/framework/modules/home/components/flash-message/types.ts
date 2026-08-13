import type { ColorValue } from 'react-native';

import type { SvgIconName } from '~/framework/components/picture';

export interface FlashMessageTint {
  accent: ColorValue;
  arc: ColorValue;
  background: ColorValue;
  icon: SvgIconName;
}
