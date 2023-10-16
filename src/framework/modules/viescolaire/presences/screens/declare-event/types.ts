import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type { CallEvent, CallEventType, CallStudent, Course, EventReason } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesDeclareEventScreenProps {}

export interface PresencesDeclareEventScreenNavParams {
  callId: number;
  course: Course;
  reasons: EventReason[];
  student: CallStudent;
  type: CallEventType;
  event?: CallEvent;
}

export interface PresencesDeclareEventScreenStoreProps {
  session?: ISession;
}

export interface PresencesDeclareEventScreenDispatchProps {}

export type PresencesDeclareEventScreenPrivateProps = PresencesDeclareEventScreenProps &
  PresencesDeclareEventScreenStoreProps &
  PresencesDeclareEventScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.declareEvent>;
