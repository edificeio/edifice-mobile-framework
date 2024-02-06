import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthLoggedAccount } from '~/framework/modules/auth/model';
import type {
  fetchPresencesCallAction,
  fetchPresencesCoursesAction,
  fetchPresencesMultipleSlotSettingAction,
  fetchPresencesRegisterPreferenceAction,
} from '~/framework/modules/viescolaire/presences/actions';
import type { Call, Course } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesCallListScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface PresencesCallListScreenNavParams {}

export interface PresencesCallListScreenStoreProps {
  allowMultipleSlots: boolean;
  courses: { [key: string]: Course[] };
  registerId: string;
  registerPreference: string;
  structureIds: string[];
  session?: AuthLoggedAccount;
  teacherId?: string;
}

export interface PresencesCallListScreenDispatchProps {
  tryFetchCall: (...args: Parameters<typeof fetchPresencesCallAction>) => Promise<Call>;
  tryFetchCourses: (...args: Parameters<typeof fetchPresencesCoursesAction>) => Promise<Course[]>;
  tryFetchMultipleSlotsSetting: (...args: Parameters<typeof fetchPresencesMultipleSlotSettingAction>) => Promise<boolean>;
  tryFetchRegisterPreference: (...args: Parameters<typeof fetchPresencesRegisterPreferenceAction>) => Promise<string>;
}

export type PresencesCallListScreenPrivateProps = PresencesCallListScreenProps &
  PresencesCallListScreenStoreProps &
  PresencesCallListScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.callList>;
