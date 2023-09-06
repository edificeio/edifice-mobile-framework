import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesMementoScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface PresencesMementoScreenNavParams {
  studentId: string;
}

export interface PresencesMementoScreenStoreProps {
  session?: ISession;
}

export interface PresencesMementoScreenDispatchProps {}

export type PresencesMementoScreenPrivateProps = PresencesMementoScreenProps &
  PresencesMementoScreenStoreProps &
  PresencesMementoScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.memento>;
