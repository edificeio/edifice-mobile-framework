import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IUser } from '~/framework/modules/auth/model';
import { UserType } from '~/framework/modules/auth/service';
import { IClassGroups } from '~/framework/modules/viescolaire/common/model';
import { IEdtCourse, ISlot, IUserChild } from '~/framework/modules/viescolaire/edt/model';
import type { EdtNavigationParams } from '~/framework/modules/viescolaire/edt/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface EdtHomeScreenProps {
  courses: IEdtCourse[];
  initialLoadingState: AsyncPagedLoadingState;
  slots: ISlot[];
  teachers: IUser[];
  childId?: string;
  classes?: string[];
  structureId?: string;
  userId?: string;
  userType?: UserType;
  fetchChildCourses: (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    classGroups: IClassGroups[],
  ) => Promise<IEdtCourse[]>;
  fetchClassGroups: (classes: string[], studentId?: string) => Promise<IClassGroups[]>;
  fetchSlots: (structureId: string) => Promise<ISlot[]>;
  fetchTeacherCourses: (
    structureId: string,
    startDate: moment.Moment,
    endDate: moment.Moment,
    teacherId: string,
  ) => Promise<IEdtCourse[]>;
  fetchTeachers: (structureId: string) => Promise<IUser[]>;
  fetchUserChildren: () => Promise<IUserChild[]>;
}

export interface EdtHomeScreenNavParams {}

export interface EdtHomeScreenPrivateProps extends NativeStackScreenProps<EdtNavigationParams, 'home'>, EdtHomeScreenProps {
  // @scaffolder add HOC props here
}
