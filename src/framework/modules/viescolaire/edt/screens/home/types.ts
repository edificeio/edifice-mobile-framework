import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { EdtNavigationParams } from '~/framework/modules/viescolaire/edt/navigation';

export interface EdtHomeScreenProps {
  courses: any;
  teachers: any;
  slots: any;
  structureId: string;
  childId: string;
  childClasses: string;
  group: string[];
  groupsIds: string[];
  teacherId: string;
  userType: string;
  fetchChildInfos: () => void;
  fetchChildGroups: (classes: string, student: string) => void;
  fetchChildCourses: (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    groups: string[],
    groupsIds: string[],
  ) => void;
  fetchClasses: (structureId: string) => void;
  fetchPersonnel: (structureId: string) => void;
  fetchTeacherCourses: (structureId: string, startDate: moment.Moment, endDate: moment.Moment, teacherId: string) => void;
  fetchSlots: (structureId: string) => void;
}

export interface EdtHomeScreenNavParams {}

export interface EdtHomeScreenPrivateProps extends NativeStackScreenProps<EdtNavigationParams, 'home'>, EdtHomeScreenProps {
  // @scaffolder add HOC props here
}
