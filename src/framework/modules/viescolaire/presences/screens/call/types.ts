import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IClassCall } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesCallScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
  classCall?: IClassCall;
  fetchClassCall: (id: string) => Promise<IClassCall>;
  postAbsentEvent: (any: any) => void;
  deleteEvent: (any: any) => void;
  validateRegister: (any: any) => void;
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
