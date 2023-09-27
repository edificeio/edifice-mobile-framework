import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Event } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesEventListScreenProps {}

export interface PresencesEventListScreenNavParams {
  events: Event[];
  key: string;
}

export interface PresencesEventListScreenStoreProps {}

export interface PresencesEventListScreenDispatchProps {}

export type PresencesEventListScreenPrivateProps = PresencesEventListScreenProps &
  PresencesEventListScreenStoreProps &
  PresencesEventListScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.eventList>;
