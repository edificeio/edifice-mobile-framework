import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Moment } from 'moment';

import { ISession } from '~/framework/modules/auth/model';
import { EventType, IClassCallStudent, IEvent, IEventReason } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesDeclareEventScreenProps {
  session?: ISession;
}

export interface PresencesDeclareEventScreenNavParams {
  callId: string;
  endDate: Moment;
  startDate: Moment;
  student: IClassCallStudent;
  type: EventType;
  event?: IEvent;
  reasons?: IEventReason[];
}

export interface PresencesDeclareEventScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'declareEvent'>,
    PresencesDeclareEventScreenProps {
  // @scaffolder add HOC props here
}
