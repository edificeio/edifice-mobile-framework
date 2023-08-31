import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type { EventType, IClassCallStudent, ICourse, IEvent, IEventReason } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesDeclareEventScreenProps {}

export interface PresencesDeclareEventScreenNavParams {
  callId: number;
  course: ICourse;
  reasons: IEventReason[];
  student: IClassCallStudent;
  type: EventType;
  event?: IEvent;
}

export interface PresencesDeclareEventScreenStoreProps {
  session?: ISession;
}

export interface PresencesDeclareEventScreenDispatchProps {}

export type PresencesDeclareEventScreenPrivateProps = PresencesDeclareEventScreenProps &
  PresencesDeclareEventScreenStoreProps &
  PresencesDeclareEventScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.declareEvent>;
