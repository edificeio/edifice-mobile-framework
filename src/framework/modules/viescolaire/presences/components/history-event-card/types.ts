import * as React from 'react';
import type { ColorValue, ViewStyle } from 'react-native';

import type { EventType } from '~/framework/modules/viescolaire/presences/model';

export interface HistoryEventCardProps extends React.PropsWithChildren {
  type: EventType;
  style?: ViewStyle;
}

export interface HistoryEventCardStyle {
  backgroundColor: ColorValue;
  iconColor: ColorValue;
  iconName: string;
}
