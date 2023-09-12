import * as React from 'react';
import type { ColorValue, ViewStyle } from 'react-native';

import type { HistoryEventType } from '~/framework/modules/viescolaire/presences/model';

export interface HistoryEventCardProps extends React.PropsWithChildren {
  type: HistoryEventType;
  style?: ViewStyle;
}

export interface HistoryEventCardStyle {
  backgroundColor: ColorValue;
  iconColor: ColorValue;
  iconName: string;
}
