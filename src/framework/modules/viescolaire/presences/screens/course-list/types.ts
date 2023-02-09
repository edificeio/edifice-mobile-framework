import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ICourse } from '~/framework/modules/viescolaire/presences/model';
import type { PresencesNavigationParams } from '~/framework/modules/viescolaire/presences/navigation';

export interface PresencesCourseListScreenProps {
  courses: ICourse[];
  registerId: string;
  teacherId: string;
  structureId: string;
  isFetching: boolean;
  multipleSlots: boolean;
  registerPreferences: string;
  getMultipleSlots: (structureId: string) => void; // get multipleSlot preference set on web
  getRegisterPreferences: () => void; // get CPE multipleSlot preference
  fetchCourses: (teacherId: string, structureId: string, startDate: string, endDate: string, multipleSlot?: boolean) => void;
  fetchRegisterId: (any: any) => void;
}

export interface PresencesCourseListScreenNavParams {
  userId?: string;
}

export interface PresencesCourseListScreenPrivateProps
  extends NativeStackScreenProps<PresencesNavigationParams, 'courseList'>,
    PresencesCourseListScreenProps {
  // @scaffolder add HOC props here
}
