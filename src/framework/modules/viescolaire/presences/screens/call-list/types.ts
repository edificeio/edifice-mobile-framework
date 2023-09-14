import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type {
  fetchPresencesClassCallAction,
  fetchPresencesCoursesAction,
  fetchPresencesMultipleSlotSettingAction,
  fetchPresencesRegisterPreferenceAction,
} from '~/framework/modules/viescolaire/presences/actions';
import type { IClassCall, ICourse } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesCallListScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface PresencesCallListScreenNavParams {}

export interface PresencesCallListScreenStoreProps {
  allowMultipleSlots: boolean;
  courses: { [key: string]: ICourse[] };
  registerId: string;
  registerPreference: string;
  structureIds: string[];
  session?: ISession;
  teacherId?: string;
}

export interface PresencesCallListScreenDispatchProps {
  tryFetchClassCall: (...args: Parameters<typeof fetchPresencesClassCallAction>) => Promise<IClassCall>;
  tryFetchCourses: (...args: Parameters<typeof fetchPresencesCoursesAction>) => Promise<ICourse[]>;
  tryFetchMultipleSlotsSetting: (...args: Parameters<typeof fetchPresencesMultipleSlotSettingAction>) => Promise<boolean>;
  tryFetchRegisterPreference: (...args: Parameters<typeof fetchPresencesRegisterPreferenceAction>) => Promise<string>;
}

export type PresencesCallListScreenPrivateProps = PresencesCallListScreenProps &
  PresencesCallListScreenStoreProps &
  PresencesCallListScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.callList>;
