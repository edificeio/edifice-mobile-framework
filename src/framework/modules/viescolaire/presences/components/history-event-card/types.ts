import * as React from 'react';
import type { ViewStyle } from 'react-native';

import type { EventType } from '~/framework/modules/viescolaire/presences/model';

export interface HistoryEventCardProps extends React.PropsWithChildren {
  type: EventType;
  style?: ViewStyle;
}
