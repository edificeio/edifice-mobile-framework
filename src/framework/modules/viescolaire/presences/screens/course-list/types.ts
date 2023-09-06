import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISession } from '~/framework/modules/auth/model';
import type {
  fetchPresencesCoursesAction,
  fetchPresencesEventReasonsAction,
  fetchPresencesMultipleSlotSettingAction,
  fetchPresencesRegisterPreferenceAction,
} from '~/framework/modules/viescolaire/presences/actions';
import type { ICourse, IEventReason } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams, presencesRouteNames } from '~/framework/modules/viescolaire/presences/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesCourseListScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface PresencesCourseListScreenNavParams {}

export interface PresencesCourseListScreenStoreProps {
  allowMultipleSlots: boolean;
  courses: ICourse[];
  registerId: string;
  registerPreference: string;
  session?: ISession;
  structureId?: string;
  teacherId?: string;
}

export interface PresencesCourseListScreenDispatchProps {
  tryFetchCourses: (...args: Parameters<typeof fetchPresencesCoursesAction>) => Promise<ICourse[]>;
  tryFetchEventReasons: (...args: Parameters<typeof fetchPresencesEventReasonsAction>) => Promise<IEventReason[]>;
  tryFetchMultipleSlotsSetting: (...args: Parameters<typeof fetchPresencesMultipleSlotSettingAction>) => Promise<boolean>;
  tryFetchRegisterPreference: (...args: Parameters<typeof fetchPresencesRegisterPreferenceAction>) => Promise<string>;
}

export type PresencesCourseListScreenPrivateProps = PresencesCourseListScreenProps &
  PresencesCourseListScreenStoreProps &
  PresencesCourseListScreenDispatchProps &
  NativeStackScreenProps<PresencesNavigationParams, typeof presencesRouteNames.courseList>;
