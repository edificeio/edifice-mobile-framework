import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Moment } from 'moment';

import { ISession } from '~/framework/modules/auth/model';
import { EventType, ICallEvent, IEventReason, IStudent } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesDeclareEventScreenProps {
  session?: ISession;
}

export interface PresencesDeclareEventScreenNavParams {
  callId: string;
  endDate: Moment;
  startDate: Moment;
  student: IStudent;
  type: EventType;
  event?: ICallEvent;
  reasons?: IEventReason[];
}

export interface PresencesDeclareEventScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'declareEvent'>,
    PresencesDeclareEventScreenProps {
  // @scaffolder add HOC props here
}
