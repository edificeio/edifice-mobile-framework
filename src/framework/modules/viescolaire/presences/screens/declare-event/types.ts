import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Moment } from 'moment';

import type { ISession } from '~/framework/modules/auth/model';
import type { EventType, IClassCallStudent, IEvent, IEventReason } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesDeclareEventScreenProps {}

export interface PresencesDeclareEventScreenNavParams {
  callId: string;
  endDate: Moment;
  startDate: Moment;
  student: IClassCallStudent;
  type: EventType;
  event?: IEvent;
  reasons?: IEventReason[];
}

export interface PresencesDeclareEventScreenStoreProps {
  session?: ISession;
}

export interface PresencesDeclareEventScreenDispatchProps {}

export type PresencesDeclareEventScreenPrivateProps = PresencesDeclareEventScreenProps &
  PresencesDeclareEventScreenStoreProps &
  PresencesDeclareEventScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.declareEvent>;
