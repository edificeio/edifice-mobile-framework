import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesMementoScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
  session?: ISession;
}

export interface PresencesMementoScreenNavParams {
  studentId: string;
}

export interface PresencesMementoScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'memento'>,
    PresencesMementoScreenProps {
  // @scaffolder add HOC props here
}
