import type { ColorValue, ViewStyle } from 'react-native';

import type { EventType } from '~/framework/modules/viescolaire/presences/model';

export interface EventPictoProps {
  type: EventType;
  style?: ViewStyle;
}

export interface EventPictoStyle {
  backgroundColor: ColorValue;
  iconColor: ColorValue;
  iconName: string;
}
