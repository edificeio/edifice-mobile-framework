import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ICourse } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface PresencesCourseListScreenProps {
  allowMultipleSlots: boolean;
  courses: ICourse[];
  initialLoadingState: AsyncPagedLoadingState;
  registerId: string;
  registerPreference: string;
  structureId?: string;
  teacherId?: string;
  fetchCourses: (
    teacherId: string,
    structureId: string,
    startDate: string,
    endDate: string,
    multipleSlot?: boolean,
  ) => Promise<ICourse[]>;
  fetchMultipleSlotsSetting: (structureId: string) => Promise<boolean>;
  fetchRegisterPreference: () => Promise<string>;
}

export interface PresencesCourseListScreenNavParams {}

export interface PresencesCourseListScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'courseList'>,
    PresencesCourseListScreenProps {
  // @scaffolder add HOC props here
}
