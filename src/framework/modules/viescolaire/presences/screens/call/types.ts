import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type { fetchPresencesClassCallAction } from '~/framework/modules/viescolaire/presences/actions';
import type { IClassCall, IEventReason } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesCallScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface PresencesCallScreenNavParams {
  classroom: string;
  id: string;
  name: string;
}

export interface PresencesCallScreenStoreProps {
  eventReasons: IEventReason[];
  classCall?: IClassCall;
  session?: ISession;
}

export interface PresencesCallScreenDispatchProps {
  tryFetchClassCall: (...args: Parameters<typeof fetchPresencesClassCallAction>) => Promise<IClassCall>;
}

export type PresencesCallScreenPrivateProps = PresencesCallScreenProps &
  PresencesCallScreenStoreProps &
  PresencesCallScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.call>;
