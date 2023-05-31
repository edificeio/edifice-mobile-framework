import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { IClassCall, IEventReason } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesCallScreenProps {
  eventReasons: IEventReason[];
  initialLoadingState: AsyncPagedLoadingState;
  classCall?: IClassCall;
  session?: ISession;
  fetchClassCall: (id: string) => Promise<IClassCall>;
}

export interface PresencesCallScreenNavParams {
  classroom: string;
  id: string;
  name: string;
}

export interface PresencesCallScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'call'>,
    PresencesCallScreenProps {
  // @scaffolder add HOC props here
}
