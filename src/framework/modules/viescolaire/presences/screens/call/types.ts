import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type { fetchPresencesCallAction, fetchPresencesEventReasonsAction } from '~/framework/modules/viescolaire/presences/actions';
import type { Call, Course, EventReason } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesCallScreenProps {}

export interface PresencesCallScreenNavParams {
  course: Course;
  id: number;
}

export interface PresencesCallScreenStoreProps {
  eventReasons: EventReason[];
  call?: Call;
  session?: ISession;
}

export interface PresencesCallScreenDispatchProps {
  tryFetchCall: (...args: Parameters<typeof fetchPresencesCallAction>) => Promise<Call>;
  tryFetchEventReasons: (...args: Parameters<typeof fetchPresencesEventReasonsAction>) => Promise<EventReason[]>;
}

export type PresencesCallScreenPrivateProps = PresencesCallScreenProps &
  PresencesCallScreenStoreProps &
  PresencesCallScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.call>;
