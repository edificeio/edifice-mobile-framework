import * as React from 'react';
import type { ColorValue } from 'react-native';

import type {
  IAbsence,
  IForgottenNotebook,
  IHistoryEvent,
  IIncident,
  IPunishment,
} from '~/framework/modules/viescolaire/presences/model';

export interface HistoryEventCardProps extends React.PropsWithChildren {
  event: IAbsence | IForgottenNotebook | IHistoryEvent | IIncident | IPunishment;
}

export interface HistoryEventCardStyle {
  backgroundColor: ColorValue;
  iconColor: ColorValue;
  iconName: string;
}
